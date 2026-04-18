import express from 'express';
import { protect, optionalAuth } from '../middleware/auth.js';
import { orchestrate, guestSearch } from '../services/orchestrator.js';
import Research from '../models/Research.js';
import User from '../models/User.js';

const router = express.Router();

// ──────────────────────────────────────────────
// POST /api/research/search  — GUEST & LOGGED IN
// Returns full AI answer, no agents required
// ──────────────────────────────────────────────
router.post('/search', optionalAuth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim().length < 2)
      return res.status(400).json({ message: 'Please provide a search query' });

    const result = await guestSearch({ query: query.trim() });

    // Safety event — log if needed
    if (result.safetyFlag && result.safetyFlag !== 'clean') {
      if (req.user) {
        await User.findByIdAndUpdate(req.user._id, {
          $push: { safetyEvents: { query, type: result.safetyFlag, severity: 'High' } }
        });
      }
      return res.json(result);
    }

    // Save to DB if logged in
    let researchId = null;
    if (req.user) {
      const doc = await Research.create({
        userId: req.user._id,
        query: query.trim(),
        searchResult: result.searchResult,
        confidenceScore: result.confidenceScore,
        status: 'done',
      });
      researchId = doc._id;

      // Save to history
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          history: {
            $each: [{ query: query.trim(), type: 'search', resultId: doc._id, createdAt: new Date() }],
            $slice: -100,
          },
        },
      });
    }

    res.json({ ...result, researchId });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────
// POST /api/research  — LOGGED-IN + AGENTS
// Full 5-agent pipeline (PRO/PREMIUM)
// ──────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { query, fileIds = [], agents } = req.body;
    if (!query || query.trim().length < 2)
      return res.status(400).json({ message: 'Please provide a research query' });

    // Subscription check
    const user = req.user;
    if (user.isBlocked) return res.status(403).json({ message: 'Your account has been blocked. Contact support.' });
    if (user.subscriptionType === 'FREE') {
      return res.status(403).json({ message: 'Agent access requires PRO or PREMIUM subscription.' });
    }

    const research = await Research.create({
      userId: user._id,
      query: query.trim(),
      fileIds,
      status: 'processing',
    });

    const result = await orchestrate({ query: query.trim(), fileIds, agents });

    if (result.safetyFlag && result.safetyFlag !== 'clean') {
      await Research.findByIdAndUpdate(research._id, { safetyFlag: result.safetyFlag, status: 'failed' });
      await User.findByIdAndUpdate(user._id, {
        $push: { safetyEvents: { query, type: result.safetyFlag, severity: 'High' } }
      });
      return res.json(result);
    }

    await Research.findByIdAndUpdate(research._id, {
      plannerOutput: result.plannerOutput,
      hunterOutput: result.hunterOutput,
      paperReader: result.paperReader,
      comparator: result.comparator,
      contradictions: result.contradictions,
      searchResult: result.searchResult,
      confidenceScore: result.confidenceScore,
      safetyFlag: 'clean',
      status: 'done',
    });

    await User.findByIdAndUpdate(user._id, {
      $push: {
        history: {
          $each: [{ query: query.trim(), type: 'research', resultId: research._id, createdAt: new Date() }],
          $slice: -100,
        },
      },
    });

    res.json({ ...result, researchId: research._id });
  } catch (err) {
    console.error('Research error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────
// GET /api/research/history — logged-in users
// ──────────────────────────────────────────────
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('history');
    res.json([...(user.history || [])].reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────
// DELETE /api/research/history/:index — delete 1 history item
// ──────────────────────────────────────────────
router.delete('/history/:resultId', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { history: { resultId: req.params.resultId } }
    });
    res.json({ message: 'History item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────
// DELETE /api/research/history — clear all history
// ──────────────────────────────────────────────
router.delete('/history', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $set: { history: [] } });
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────
// POST /api/research/:id/share — generate share link
// ──────────────────────────────────────────────
router.post('/:id/share', protect, async (req, res) => {
  try {
    const research = await Research.findOne({ _id: req.params.id, userId: req.user._id });
    if (!research) return res.status(404).json({ message: 'Research not found' });

    if (!research.shareToken) {
      research.generateShareToken();
      await research.save();
    }

    res.json({
      shareToken: research.shareToken,
      shareUrl: `${req.headers.origin || 'http://localhost:5173'}/share/${research.shareToken}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────
// GET /api/research/share/:token — view shared result (public)
// ──────────────────────────────────────────────
router.get('/share/:token', async (req, res) => {
  try {
    const research = await Research.findOne({ shareToken: req.params.token, isPublic: true });
    if (!research) return res.status(404).json({ message: 'Shared research not found' });
    res.json(research);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────
// GET /api/research/:id — get full research by ID
// ──────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const research = await Research.findOne({ _id: req.params.id, userId: req.user._id });
    if (!research) return res.status(404).json({ message: 'Research not found' });
    res.json(research);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
