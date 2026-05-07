import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectMongoDB, connectNeo4j } from './config/db.js';
import { seedAdmin } from './utils/seedAdmin.js';
import authRoutes from './routes/auth.js';
import researchRoutes from './routes/research.js';
import uploadRoutes from './routes/upload.js';
import subscriptionRoutes from './routes/subscription.js';
import adminRoutes from './routes/admin.js';
import projectRoutes from './routes/project.js';
import graphRoutes from './routes/graph.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/graph', graphRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'AlgoVision API v2.0', 
    status: 'running',
    endpoints: ['/api/auth', '/api/research', '/api/upload', '/api/subscription', '/api/admin', '/api/projects', '/api/graph']
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  await connectMongoDB();
  await connectNeo4j();
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`\n🚀 AlgoVision API v2.0 running on http://localhost:${PORT}`);
    console.log(`📖 Health check: http://localhost:${PORT}/`);
    console.log(`🔗 Graph API: http://localhost:${PORT}/api/graph`);
  });
}

start().catch(console.error);
