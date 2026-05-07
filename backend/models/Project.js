import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  logo: { type: String, default: '' }, // URL or path to project logo
  color: { type: String, default: '#ec4899' }, // Project accent color
  settings: {
    aiMode: { type: String, enum: ['fast', 'deep'], default: 'fast' }, // Groq vs Gemini
    enabledAgents: { type: [String], default: ['planner', 'hunter', 'paperReader', 'comparator', 'contradictionDetector', 'insightGenerator'] },
    resultView: { type: String, enum: ['compact', 'detailed'], default: 'detailed' },
    showGraph: { type: Boolean, default: true },
  },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
