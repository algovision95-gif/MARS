import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

const PLANS = {
  FREE:    { name: 'Free',    price: 0,   dailyLimitMB: 0,    agentAccess: false, features: ['Basic search', 'AI responses'] },
  PRO:     { name: 'Pro',     price: 499, dailyLimitMB: 100,  agentAccess: true,  features: ['All agents', '100MB/day uploads', 'History', 'Share links'] },
  PREMIUM: { name: 'Premium', price: 999, dailyLimitMB: 1024, agentAccess: true,  features: ['All agents', '1GB/day uploads', 'Priority processing', 'Full features'] },
};

// GET /api/subscription/plans
router.get('/plans', async (req, res) => {
  res.json(PLANS);
});

// POST /api/subscription/subscribe
router.post('/subscribe', protect, async (req, res) => {
  try {
    const { plan } = req.body;
    const targetPlan = plan?.toUpperCase();
    if (!PLANS[targetPlan]) return res.status(400).json({ message: 'Invalid plan. Choose PRO or PREMIUM.' });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { subscriptionType: targetPlan },
      { new: true, select: '-password' }
    );
    res.json({
      message: `🎉 Successfully upgraded to ${PLANS[targetPlan].name}!`,
      subscriptionType: user.subscriptionType,
      plan: PLANS[targetPlan],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/upgrade', protect, async (req, res) => {
  try {
    const { type } = req.body;
    console.log(`💳 Upgrade request for user ${req.user.email} to ${type}`);
    
    const targetPlan = type?.toUpperCase();
    if (!PLANS[targetPlan]) {
      console.error(`❌ Invalid plan attempted: ${targetPlan}`);
      return res.status(400).json({ message: 'Invalid plan selected.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id, 
      { subscriptionType: targetPlan }, 
      { new: true, runValidators: true }
    );

    if (!user) {
      console.error('❌ User not found during upgrade');
      return res.status(404).json({ message: 'User session not found.' });
    }

    console.log(`✅ Upgrade successful for ${user.email}`);
    res.json({ 
      message: `Successfully upgraded to ${targetPlan}`, 
      subscriptionType: user.subscriptionType 
    });
  } catch (err) {
    console.error('❌ Upgrade Error:', err);
    res.status(500).json({ message: 'Internal server error during upgrade. Please try again.' });
  }
});

// POST /api/subscription/cancel
router.post('/cancel', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { subscriptionType: 'FREE' },
      { new: true, select: '-password' }
    );
    res.json({
      message: 'Subscription cancelled. You are now on the FREE plan.',
      subscriptionType: user.subscriptionType,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/subscription/status
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscriptionType dailyUsageMB uploadsToday');
    const plan = PLANS[user.subscriptionType] || PLANS.FREE;
    res.json({
      subscriptionType: user.subscriptionType,
      plan,
      dailyUsageMB: parseFloat((user.dailyUsageMB || 0).toFixed(2)),
      uploadsToday: user.uploadsToday || 0,
      dailyLimitMB: plan.dailyLimitMB,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
