import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String },
  profileImage: { type: String },
  phoneNumber: { type: String },
  authProvider: { type: String, enum: ['LOCAL', 'GOOGLE'], default: 'LOCAL' },
  googleId: { type: String },
  email: { 
    type: String, required: true, unique: true, lowercase: true, trim: true 
  },
  password: { 
    type: String, 
    required: function() { return this.authProvider === 'LOCAL'; } 
  },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  subscriptionType: { type: String, enum: ['FREE', 'PRO', 'PREMIUM'], default: 'FREE' },
  isBlocked: { type: Boolean, default: false },
  uploadsToday: { type: Number, default: 0 },
  dailyUsageMB: { type: Number, default: 0 },
  lastUploadDate: { type: Date, default: Date.now },
  history: [{
    query: String,
    type: { type: String, default: 'research' },
    resultId: { type: mongoose.Schema.Types.ObjectId, ref: 'Research' },
    shareToken: String,
    createdAt: { type: Date, default: Date.now }
  }],
  safetyEvents: [{
    query: String,
    type: String, // 'harmful' | 'suicidal' | 'abusive'
    severity: String,
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

export default mongoose.model('User', userSchema);
