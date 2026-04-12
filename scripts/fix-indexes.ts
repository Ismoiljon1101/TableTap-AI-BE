import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tabletap';
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('orders');
    
    console.log('Checking indexes for collection: orders');
    const indexes = await collection.indexes();
    console.log('Current indexes:', JSON.stringify(indexes, null, 2));
    
    const badIndexName = 'restaurantId_1_orderNumber_1';
    const hasBadIndex = indexes.some(idx => idx.name === badIndexName);
    
    if (hasBadIndex) {
      console.log(`Dropping legacy index: ${badIndexName}`);
      await collection.dropIndex(badIndexName);
      console.log('Index dropped successfully');
    } else {
      console.log(`Index ${badIndexName} not found. No action needed.`);
    }
    
    // Verify intended index
    const correctIndexName = 'restaurantId_1_orderDate_1_orderNumber_1';
    const hasCorrectIndex = indexes.some(idx => idx.name === correctIndexName);
    
    if (!hasCorrectIndex) {
      console.log(`Warning: Intended index ${correctIndexName} not found in current listing.`);
      console.log('Creating correct composite unique index...');
      await collection.createIndex(
        { restaurantId: 1, orderDate: 1, orderNumber: 1 },
        { unique: true, name: correctIndexName }
      );
      console.log('Correct index created successfully');
    } else {
      console.log(`Correct index ${correctIndexName} already exists.`);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();
