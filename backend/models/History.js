import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // null = no project group
  query: { type: String, required: true },
  response: { type: String, required: true },
  mode: { type: String },
  model: { type: String },
  researchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Research' }
}, { timestamps: true });

export default mongoose.model('History', historySchema);
