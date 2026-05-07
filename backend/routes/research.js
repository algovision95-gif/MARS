import express from 'express';
import { protect, optionalAuth } from '../middleware/auth.js';
import { orchestrate, guestSearch, generateTitle } from '../services/orchestrator.js';
import Research from '../models/Research.js';
import User from '../models/User.js';
import History from '../models/History.js';

const router = express.Router();

// ──────────────────────────────────────────────
// POST /api/research/search  — GUEST & LOGGED IN
// Returns full AI answer, no agents required
// ──────────────────────────────────────────────
router.post('/search', optionalAuth, async (req, res) => {
  try {
    const { query, mode, model } = req.body;
    if (!query || query.trim().length < 2)
      return res.status(400).json({ message: 'Please provide a search query' });

    const result = await guestSearch({ 
      query: query.trim(), 
      mode: mode || 'quick', 
      model: model || 'openai/gpt-4o-mini' 
    });

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
        projectId: req.body.projectId || null,
        query: query.trim(),
        title: result.title || '',
        searchResult: result.searchResult,
        confidenceScore: result.confidenceScore,
        mode: result.mode,
        modelUsed: result.modelUsed,
        suggestions: result.suggestions,
        status: 'done',
      });
      researchId = doc._id;

      await History.create({
        userId: req.user._id,
        projectId: req.body.projectId || null,
        query: query.trim(),
        response: result.searchResult,
        mode: result.mode,
        model: result.modelUsed,
        researchId: doc._id
      });
    }

    res.json({ ...result, researchId });
  } catch (err) {
    console.error('[Search Route Error]:', err);
    
    // Categorize error for frontend
    const msg = err.message || '';
    if (msg.includes('429') || msg.includes('quota') || msg.includes('limit')) {
      return res.status(429).json({ 
        success: false, 
        type: 'quota_limit', 
        message: 'Intelligence capacity reached.' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      type: 'server_error', 
      message: 'Research module synchronization failed.' 
    });
  }
});

// ──────────────────────────────────────────────
// POST /api/research  — LOGGED-IN + AGENTS
// Full 6-agent pipeline (PRO/PREMIUM)
// ──────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { query, fileIds = [], agents, context = [], projectId, mode, model } = req.body;
    if (!query || query.trim().length < 2)
      return res.status(400).json({ message: 'Please provide a research query' });

    const user = req.user;
    if (user.isBlocked) return res.status(403).json({ message: 'Your account has been blocked. Contact support.' });
    
    // We allow FREE users here because orchestrate() handles the agent count limits (max 2 for FREE).
    // This ensures consistency between different tiers while maintaining premium value.

    const research = await Research.create({
      userId: user._id,
      projectId: projectId || null,
      query: query.trim(),
      fileIds,
      mode: mode || 'standard',
      modelUsed: model || 'openai/gpt-4o',
      status: 'processing',
    });

    const result = await orchestrate({ 
      query: query.trim(), 
      fileIds, 
      agents, 
      context,
      projectId: projectId || null,
      researchId: research._id,
      subscriptionType: user.subscriptionType,
      mode: mode || 'standard',
      model: model || 'openai/gpt-4o'
    });

    if (result.safetyFlag && result.safetyFlag !== 'clean') {
      await Research.findByIdAndUpdate(research._id, { safetyFlag: result.safetyFlag, status: 'failed' });
      await User.findByIdAndUpdate(user._id, {
        $push: { safetyEvents: { query, type: result.safetyFlag, severity: 'High' } }
      });
      return res.json(result);
    }

    await Research.findByIdAndUpdate(research._id, {
      title: result.title || '',
      plannerOutput: result.plannerOutput,
      hunterOutput: result.hunterOutput,
      paperReader: result.paperReader,
      comparator: result.comparator,
      contradictions: result.contradictions,
      insightOutput: result.insightOutput,
      gapOutput: result.gapOutput,
      graphData: result.graphData,
      searchResult: result.searchResult,
      suggestions: result.suggestions,
      confidenceScore: result.confidenceScore,
      agentLog: result.agentLog,
      safetyFlag: 'clean',
      status: 'done',
    });

    await History.create({
      userId: user._id,
      projectId: projectId || null,
      query: query.trim(),
      response: result.searchResult || '',
      mode: result.mode,
      model: result.modelUsed,
      researchId: research._id
    });

    res.json({ ...result, researchId: research._id });
  } catch (err) {
    console.error('[Research Route Error]:', err);
    
    const msg = err.message || '';
    if (msg.includes('429') || msg.includes('quota') || msg.includes('limit')) {
      return res.status(429).json({ 
        success: false, 
        type: 'quota_limit', 
        message: 'Research capacity temporarily busy.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      type: 'server_error', 
      message: 'Deep research orchestration failed.' 
    });
  }
});

// ──────────────────────────────────────────────
// PATCH /api/research/:id/rename — rename a research item
// ──────────────────────────────────────────────
router.patch('/:id/rename', protect, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const research = await Research.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title },
      { new: true }
    );
    if (!research) return res.status(404).json({ message: 'Research not found' });
    // Also update history
    await History.updateOne({ researchId: research._id }, { query: title });
    res.json({ title: research.title });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────
// POST /api/research/:id/suggest-title — AI title suggestion
// ──────────────────────────────────────────────
router.post('/:id/suggest-title', protect, async (req, res) => {
  try {
    const research = await Research.findOne({ _id: req.params.id, userId: req.user._id });
    if (!research) return res.status(404).json({ message: 'Research not found' });
    const title = await generateTitle(research.query);
    res.json({ title });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────
// DELETE /api/research/:id — delete a single research
// ──────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    await Research.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    await History.deleteMany({ researchId: req.params.id });
    res.json({ message: 'Research deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────
// GET /api/research/history — logged-in users
// ──────────────────────────────────────────────
router.get('/history', protect, async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }
    const history = await History.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────
// PATCH /api/research/history/:id/pin — toggle pin
// ──────────────────────────────────────────────
router.patch('/history/:id/pin', protect, async (req, res) => {
  try {
    const history = await History.findOne({ _id: req.params.id, userId: req.user._id });
    if (!history) return res.status(404).json({ message: 'History not found' });
    history.isPinned = !history.isPinned;
    await history.save();
    res.json({ isPinned: history.isPinned });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ──────────────────────────────────────────────
// PATCH /api/research/history/:id/archive — toggle archive
// ──────────────────────────────────────────────
router.patch('/history/:id/archive', protect, async (req, res) => {
  try {
    const history = await History.findOne({ _id: req.params.id, userId: req.user._id });
    if (!history) return res.status(404).json({ message: 'History not found' });
    history.isArchived = !history.isArchived;
    await history.save();
    res.json({ isArchived: history.isArchived });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ──────────────────────────────────────────────
// PATCH /api/research/history/:id/move — move to project
// ──────────────────────────────────────────────
router.patch('/history/:id/move', protect, async (req, res) => {
  try {
    const { projectId } = req.body;
    const history = await History.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { projectId: projectId || null },
      { new: true }
    );
    if (!history) return res.status(404).json({ message: 'History not found' });
    // Also update associated Research
    if (history.researchId) {
      await Research.updateOne({ _id: history.researchId }, { projectId: projectId || null });
    }
    res.json(history);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ──────────────────────────────────────────────
// DELETE /api/research/history/:id — delete 1 history item
// ──────────────────────────────────────────────
router.delete('/history/:id', protect, async (req, res) => {
  try {
    await History.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
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
    const filter = { userId: req.user._id };
    if (req.query.projectId) filter.projectId = req.query.projectId;
    await History.deleteMany(filter);
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
