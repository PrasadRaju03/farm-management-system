import mongoose from 'mongoose';
import config from './env.js';

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

export default connectDB;