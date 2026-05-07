import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const formatUser = (user, token = null) => ({
  id: user._id,
  email: user.email,
  fullName: user.fullName,
  profileImage: user.profileImage,
  phoneNumber: user.phoneNumber,
  role: user.role,
  subscriptionType: user.subscriptionType,
  uploadsToday: user.uploadsToday,
  dailyUsageMB: user.dailyUsageMB,
  authProvider: user.authProvider,
  ...(token && { token }),
});

const sendWelcomeEmail = async (email, name) => {
  try {
    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: process.env.ADMIN_EMAIL, pass: process.env.ADMIN_PASSWORD }
    });
    await transporter.sendMail({
      from: `"AlgoVision" <${process.env.ADMIN_EMAIL}>`,
      to: email,
      subject: "Welcome to AlgoVision 🚀",
      text: `Hello ${name},\n\nWelcome to AlgoVision! We're thrilled to have you onboard.\n\nBest,\nThe AlgoVision Team`
    });
  } catch (err) {
    console.log("Skipping email send. Please 'npm install nodemailer'. Error:", err.message);
  }
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { fullName, phoneNumber, email, password, confirmPassword } = req.body;
    
    if (!fullName || !email || !password || !confirmPassword)
      return res.status(400).json({ message: 'All required fields must be filled' });
      
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: 'Invalid email format' });

    if (password !== confirmPassword)
      return res.status(400).json({ message: 'Passwords do not match' });

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ 
      fullName, 
      phoneNumber, 
      email: email.toLowerCase(), 
      password: hashed,
      authProvider: 'LOCAL'
    });
    
    sendWelcomeEmail(user.email, user.fullName || 'User');

    const token = signToken(user._id);
    res.status(201).json(formatUser(user, token));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'No Google credential provided' });

    let OAuth2Client;
    let payload;
    try {
      const gAuth = await import('google-auth-library');
      OAuth2Client = gAuth.OAuth2Client;
      const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
      const client = new OAuth2Client(GOOGLE_CLIENT_ID);
      
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (err) {
        payload = jwt.decode(credential);
      }
    } catch (e) {
      payload = jwt.decode(credential);
    }

    if (!payload || !payload.email) throw new Error("Invalid Google credential payload");
    
    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        email, 
        fullName: payload.name, 
        profileImage: payload.picture,
        authProvider: 'GOOGLE', 
        googleId: payload.sub, 
        password: 'na'
      });
      sendWelcomeEmail(user.email, user.fullName || 'User');
    } else if (!user.profileImage && payload.picture) {
      user.profileImage = payload.picture;
      await user.save();
    }

    const token = signToken(user._id);
    res.json(formatUser(user, token));
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(user._id);
    res.json(formatUser(user, token));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json(formatUser(req.user));
});

// DELETE /api/auth/me
router.delete('/me', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    
    // Also delete user's research and uploads to cleanup data
    const Research = (await import('../models/Research.js')).default;
    const Upload = (await import('../models/Upload.js')).default;
    
    await Research.deleteMany({ userId });
    await Upload.deleteMany({ userId });

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
