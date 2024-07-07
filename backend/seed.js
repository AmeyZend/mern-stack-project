import fetch from 'node-fetch';
import mongoose from 'mongoose';
import Transaction from './models/Transaction';

const seedDatabase = async () => {
  try {
    const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = await response.json();
    await Transaction.deleteMany({});
    await Transaction.insertMany(data);
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

const connectAndSeed = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mernstack', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');
    await seedDatabase();
  } catch (err) {
    console.error('MongoDB connection error:', err);
  } finally {
    mongoose.connection.close();
  }
};

export default connectAndSeed;
