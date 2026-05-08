import mongoose from 'mongoose';
import neo4j from 'neo4j-driver';

export let neo4jDriver = null;

// This is our database connection file 
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
      console.error('   Fix Option 3: Use local MongoDB — set MONGO_URI=mongodb://localhost:27017/algovision in .env\n');
    } else if (msg.includes('Authentication') || msg.includes('auth')) {
      console.error('   Fix: Check MongoDB username/password in your MONGO_URI in .env\n');
    }

    console.warn('⚠️  Running without MongoDB — login/signup/history will not work.\n');
  }
}

export async function connectNeo4j() {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USER;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !user || !password) {
    console.warn('⚠️  Neo4j credentials not found in .env — graph features disabled.');
    return null;
  }

  try {
    neo4jDriver = neo4j.driver(
      uri,
      neo4j.auth.basic(user, password),
      { connectionTimeout: 15000, maxConnectionPoolSize: 50 }
    );
    // Verify connectivity
    await neo4jDriver.verifyConnectivity();
    console.log('✅ Connected to Neo4j');
    return neo4jDriver;
  } catch (err) {
    console.warn('⚠️  Neo4j connection failed:', err.message);
    console.warn('   Graph features will be disabled. Research will still work via MongoDB.');
    neo4jDriver = null;
    return null;
  }
}

export function getNeo4jSession() {
  if (!neo4jDriver) return null;
  return neo4jDriver.session();
}
