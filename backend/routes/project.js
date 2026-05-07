import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.js';
import Project from '../models/Project.js';
import History from '../models/History.js';
import Research from '../models/Research.js';
import Upload from '../models/Upload.js';

const router = express.Router();

// Logo upload config
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `logo_${Date.now()}${path.extname(file.originalname)}`),
});
const logoUpload = multer({ storage: logoStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/projects — list all projects for user
router.get('/', protect, async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.includeArchived !== 'true') {
      filter.isArchived = { $ne: true };
    }
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    
    // Enrich each project with dataset count + research count
    const enriched = await Promise.all(projects.map(async (p) => {
      const [datasetCount, researchCount] = await Promise.all([
        Upload.countDocuments({ projectId: p._id }),
        Research.countDocuments({ projectId: p._id, userId: req.user._id }),
      ]);
      return { ...p.toObject(), datasetCount, researchCount };
    }));
    
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/:id — get single project with details
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const [datasets, researchCount] = await Promise.all([
      Upload.find({ projectId: project._id }).sort({ createdAt: -1 }).select('-extractedText'),
      Research.countDocuments({ projectId: project._id }),
    ]);
    
    res.json({ ...project.toObject(), datasets, researchCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects — create project
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });
    const project = await Project.create({ 
      userId: req.user._id, 
      name,
      description: description || '',
      color: color || '#ec4899',
    });
    res.status(201).json({ ...project.toObject(), datasetCount: 0, researchCount: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/projects/:id — update project (rename, description, color, settings)
router.patch('/:id', protect, async (req, res) => {
  try {
    const { name, description, color, settings } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (color !== undefined) update.color = color;
    if (settings !== undefined) update.settings = settings;
    
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      update,
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects/:id/logo — upload project logo
router.post('/:id/logo', protect, logoUpload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const logoUrl = `/api/uploads/${req.file.filename}`;
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { logo: logoUrl },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ logo: logoUrl, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ──────────────────────────────────────────────
// PATCH /api/projects/:id/archive — toggle project archive
// ──────────────────────────────────────────────
router.patch('/:id/archive', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.isArchived = !project.isArchived;
    await project.save();
    res.json({ isArchived: project.isArchived });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/projects/:id/datasets — list datasets for a project
router.get('/:id/datasets', protect, async (req, res) => {
  try {
    const datasets = await Upload.find({ projectId: req.params.id })
      .sort({ createdAt: -1 })
      .select('-extractedText');
    res.json(datasets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    await History.deleteMany({ projectId: req.params.id, userId: req.user._id });
    await Research.updateMany({ projectId: req.params.id }, { $unset: { projectId: '' } });
    res.json({ message: 'Project and associated history deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
