import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Upload from '../models/Upload.js';
import { processFile } from '../services/fileProcessor.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav',
  'video/mp4',
];

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error(`File type "${file.mimetype}" not supported`), false);
  },
  limits: { fileSize: 1024 * 1024 * 1024 },
});

// POST /api/upload
router.post('/', protect, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const user = await User.findById(req.user._id);
    const fileSizeMB = req.file.size / (1024 * 1024);

    // Reset daily if new day
    const today = new Date().toDateString();
    const lastDate = new Date(user.lastUploadDate).toDateString();
    if (today !== lastDate) {
      user.uploadsToday = 0;
      user.dailyUsageMB = 0;
    }

    const fileLimitMB = user.subscriptionType === 'FREE' ? 10 : 1024;
    const dailyLimitMB = user.subscriptionType === 'FREE' ? 100 : 1024;

    if (fileSizeMB > fileLimitMB) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        message: `File too large. Max ${fileLimitMB}MB per file on your ${user.subscriptionType} plan.`,
      });
    }

    if (user.dailyUsageMB + fileSizeMB > dailyLimitMB) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        message: 'Daily upload limit reached. Upgrade to PREMIUM to continue.',
      });
    }

    let fileType = 'document';
    if (req.file.mimetype.startsWith('audio/')) fileType = 'audio';
    else if (req.file.mimetype.startsWith('video/')) fileType = 'video';

    const uploadRecord = await Upload.create({
      userId: user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      sizeMB: fileSizeMB,
      filePath: req.file.path,
      type: fileType,
      status: 'pending',
    });

    // Process async
    processFile(uploadRecord._id, req.file.path, req.file.mimetype)
      .catch((err) => console.error('File processing error:', err));

    user.uploadsToday += 1;
    user.dailyUsageMB += fileSizeMB;
    user.lastUploadDate = new Date();
    await user.save();

    res.json({
      message: 'File uploaded successfully',
      fileId: uploadRecord._id,
      filename: req.file.originalname,
      sizeMB: fileSizeMB.toFixed(2),
      type: fileType,
      uploadsToday: user.uploadsToday,
      dailyUsageMB: parseFloat(user.dailyUsageMB.toFixed(2)),
    });
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/upload/:id/status
router.get('/:id/status', protect, async (req, res) => {
  try {
    const upload = await Upload.findOne({ _id: req.params.id, userId: req.user._id });
    if (!upload) return res.status(404).json({ message: 'Upload not found' });
    res.json({ status: upload.status, hasText: upload.extractedText?.length > 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
