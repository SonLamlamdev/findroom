const mongoose = require('mongoose');
require('dotenv').config();

const { Conversation } = require('../models/Message');

async function fixConversationIndex() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-accommodation';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get the collection
    const collection = mongoose.connection.db.collection('conversations');
    
    // List all indexes
    console.log('\n📋 Current indexes:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(JSON.stringify(index, null, 2));
    });

    // Drop the problematic unique index if it exists
    try {
      await collection.dropIndex('participants_1_listing_1');
      console.log('\n✅ Dropped old unique index: participants_1_listing_1');
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('\nℹ️  Index participants_1_listing_1 does not exist or already dropped');
      } else {
        throw error;
      }
    }

    // Drop any other unique index on participants if exists
    try {
      await collection.dropIndex('participants_1');
      console.log('✅ Dropped old unique index: participants_1');
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  Index participants_1 does not exist or already dropped');
      } else {
        throw error;
      }
    }

    // Let Mongoose recreate indexes based on schema
    console.log('\n🔄 Recreating indexes based on schema...');
    await Conversation.syncIndexes();
    console.log('✅ Indexes recreated');

    // List indexes after fix
    console.log('\n📋 New indexes:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach(index => {
      console.log(JSON.stringify(index, null, 2));
    });

    console.log('\n✅ Index fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
    process.exit(1);
  }
}

fixConversationIndex();

