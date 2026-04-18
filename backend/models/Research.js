import mongoose from 'mongoose';
import crypto from 'crypto';

const researchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = guest
  query: { type: String, required: true },
  fileIds: [String],
  // Agent outputs
  plannerOutput: mongoose.Schema.Types.Mixed,
  hunterOutput: mongoose.Schema.Types.Mixed,
  paperReader: mongoose.Schema.Types.Mixed,
  comparator: mongoose.Schema.Types.Mixed,
  contradictions: mongoose.Schema.Types.Mixed,
  // AI search result (guest & logged-in)
  searchResult: { type: String },
  confidenceScore: { type: Number, min: 0, max: 100 },
  // Sharing
  shareToken: { type: String, unique: true, sparse: true },
  isPublic: { type: Boolean, default: false },
  // Safety
  safetyFlag: { type: String }, // 'clean' | 'harmful' | 'suicidal' | 'abusive'
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'done', 'failed'], 
    default: 'pending' 
  },
}, { timestamps: true });

// Generate a share token
researchSchema.methods.generateShareToken = function () {
  const token = crypto.randomBytes(12).toString('hex');
  this.shareToken = token;
  this.isPublic = true;
  return token;
};

export default mongoose.model('Research', researchSchema);
