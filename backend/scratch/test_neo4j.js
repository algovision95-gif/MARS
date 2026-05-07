import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

console.log('Attempting to connect to Neo4j...');
console.log('URI:', uri);
console.log('User:', user);

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function check() {
  try {
    await driver.verifyConnectivity();
    console.log('✅ Connection successful!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await driver.close();
  }
}

check();
