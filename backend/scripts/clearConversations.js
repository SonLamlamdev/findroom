require('dotenv').config({ path: '../.env' }); // Adjust path to .env if needed
const mongoose = require('mongoose');
const { Conversation } = require('../models/Message');
const Message = require('../models/Message');

const clearData = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Delete all
    const convResult = await Conversation.deleteMany({});
    console.log(`Deleted ${convResult.deletedCount} conversations.`);

    const msgResult = await Message.deleteMany({});
    console.log(`Deleted ${msgResult.deletedCount} messages.`);

    console.log('Done! All chat data cleared.');
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearData();