import mongoose from 'mongoose';
import crypto from 'crypto';

const researchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = guest
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  // User query & custom title
  query: { type: String, required: true },
  title: { type: String, default: '' }, // Auto-generated or user-renamed title
  fileIds: [String],
  // Agent outputs (6 agents)
  plannerOutput: mongoose.Schema.Types.Mixed,
  hunterOutput: mongoose.Schema.Types.Mixed,
  paperReader: mongoose.Schema.Types.Mixed,
  comparator: mongoose.Schema.Types.Mixed,
  contradictions: mongoose.Schema.Types.Mixed,
  insightOutput: mongoose.Schema.Types.Mixed, // NEW: Insight Generator
  gapOutput: mongoose.Schema.Types.Mixed, // NEW: Research Gap Finder
  graphData: mongoose.Schema.Types.Mixed, // NEW: Knowledge Graph extract
  // AI search result
  searchResult: { type: String },
  confidenceScore: { type: Number, min: 0, max: 100 },
  // Research Mode & Model
  mode: { type: String, enum: ['quick', 'standard', 'deep'], default: 'standard' },
  modelUsed: { type: String, default: 'gpt-4o-mini' },
  // Follow-up suggestions
  suggestions: [{
    text: String,
    type: { type: String, enum: ['deep-dive', 'follow-up'] }
  }],
  // Sharing
  shareToken: { type: String, unique: true, sparse: true },
  isPublic: { type: Boolean, default: false },
  // Safety
  safetyFlag: { type: String },
  status: {
    type: String,
    enum: ['pending', 'processing', 'done', 'failed'],
    default: 'pending'
  },
  // Agent execution metadata
  agentLog: [{
    agent: String,
    status: String,
    startedAt: Date,
    completedAt: Date,
    durationMs: Number,
  }],
}, { timestamps: true });

// Generate a share token
researchSchema.methods.generateShareToken = function () {
  const token = crypto.randomBytes(12).toString('hex');
  this.shareToken = token;
  this.isPublic = true;
  return token;
};

// Auto-generate title from query if not set
researchSchema.pre('save', function (next) {
  if (!this.title && this.query) {
    // Create a short title from the query (first 60 chars, capitalize)
    const words = this.query.split(' ').slice(0, 8).join(' ');
    this.title = words.charAt(0).toUpperCase() + words.slice(1);
  }
  next();
});

export default mongoose.model('Research', researchSchema);
