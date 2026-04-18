import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import User from '../models/User.js';
import Research from '../models/Research.js';
import Upload from '../models/Upload.js';

const router = express.Router();

// GET /api/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/stats — usage reports
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, proUsers, premiumUsers, freeUsers, totalResearch, totalUploads, blockedUsers, safetyEvents] = 
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ subscriptionType: 'PRO' }),
        User.countDocuments({ subscriptionType: 'PREMIUM' }),
        User.countDocuments({ subscriptionType: 'FREE' }),
        Research.countDocuments(),
        Upload.countDocuments(),
        User.countDocuments({ isBlocked: true }),
        User.aggregate([{ $project: { count: { $size: { $ifNull: ['$safetyEvents', []] } } } }, { $group: { _id: null, total: { $sum: '$count' } } }]),
      ]);

    const recentResearch = await Research.find({}).sort({ createdAt: -1 }).limit(10).populate('userId', 'email');
    const topUsers = await User.find({}, '-password').sort({ createdAt: -1 }).limit(5);

    res.json({
      totalUsers, proUsers, premiumUsers, freeUsers,
      totalResearch, totalUploads, blockedUsers,
      totalSafetyEvents: safetyEvents[0]?.total || 0,
      recentResearch,
      topUsers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/users/:id — change subscription
router.patch('/users/:id/subscription', protect, adminOnly, async (req, res) => {
  try {
    const { subscriptionType } = req.body;
    if (!['FREE', 'PRO', 'PREMIUM'].includes(subscriptionType))
      return res.status(400).json({ message: 'Invalid subscription type' });
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { subscriptionType },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/users/:id — general update (kept for backward compat)
router.patch('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { subscriptionType } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { subscriptionType },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/admin/users/:id/block — block/unblock user
router.patch('/users/:id/block', protect, adminOnly, async (req, res) => {
  try {
    const { blocked } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: blocked },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `User ${blocked ? 'blocked' : 'unblocked'}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id — delete user
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Research.deleteMany({ userId: req.params.id });
    res.json({ message: 'User and their data deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id/history — delete any user's history
router.delete('/users/:id/history', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { $set: { history: [] } });
    res.json({ message: 'User history cleared by admin' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/safety — safety event log
router.get('/safety', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find(
      { 'safetyEvents.0': { $exists: true } },
      'email safetyEvents createdAt'
    ).sort({ updatedAt: -1 });
    
    const events = users.flatMap(u => 
      u.safetyEvents.map(e => ({
        userId: u._id,
        email: u.email,
        query: e.query,
        type: e.type,
        severity: e.severity,
        createdAt: e.createdAt,
      }))
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
