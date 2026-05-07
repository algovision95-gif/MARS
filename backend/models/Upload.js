import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Link to project
  filename: String,
  originalName: String,
  mimetype: String,
  sizeMB: Number,
  filePath: String,
  extractedText: { type: String, default: '' },
  type: { type: String, enum: ['document', 'audio', 'video', 'image', 'dataset'] },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'processed', 'failed'], 
    default: 'pending' 
  },
}, { timestamps: true });

export default mongoose.model('Upload', uploadSchema);
