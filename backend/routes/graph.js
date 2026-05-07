import express from 'express';
import { protect } from '../middleware/auth.js';
import { getProjectGraph, getResearchGraph, isNeo4jAvailable } from '../services/neo4jService.js';

const router = express.Router();

// GET /api/graph/status — check Neo4j availability
router.get('/status', (req, res) => {
  res.json({ available: isNeo4jAvailable() });
});

// GET /api/graph/project/:projectId — get knowledge graph for a project
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    if (!isNeo4jAvailable()) {
      return res.json({ nodes: [], edges: [], message: 'Neo4j not connected' });
    }
    const graph = await getProjectGraph(req.params.projectId);
    res.json(graph);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/graph/research/:researchId — get graph for a specific research
router.get('/research/:researchId', protect, async (req, res) => {
  try {
    if (!isNeo4jAvailable()) {
      return res.json({ nodes: [], edges: [], message: 'Neo4j not connected' });
    }
    const graph = await getResearchGraph(req.params.researchId);
    res.json(graph);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
