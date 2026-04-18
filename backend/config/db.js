import mongoose from 'mongoose';
import neo4j from 'neo4j-driver';

export let neo4jDriver = null;

export async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    const msg = err.message || '';
    console.error('\n❌ MongoDB Connection Failed:', msg);

    if (msg.includes('querySrv') || msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND')) {
      console.error('   Fix Option 1: Go to https://cloud.mongodb.com → Resume cluster if PAUSED');
      console.error('   Fix Option 2: Network Access → Add IP → Allow from Anywhere (0.0.0.0/0)');
      console.error('   Fix Option 3: Use local MongoDB — set MONGO_URI=mongodb://localhost:27017/mars in .env\n');
    } else if (msg.includes('Authentication') || msg.includes('auth')) {
      console.error('   Fix: Check MongoDB username/password in your MONGO_URI in .env\n');
    }

    console.warn('⚠️  Running without MongoDB — login/signup/history will not work.\n');
  }
}

export function connectNeo4j() {
  try {
    neo4jDriver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
      { connectionTimeout: 10000, maxConnectionPoolSize: 50 }
    );
    console.log('✅ Neo4j driver initialized');
    return neo4jDriver;
  } catch (err) {
    console.error('⚠️  Neo4j connection failed:', err.message);
    return null;
  }
}
