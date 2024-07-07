import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  price: Number,
  category: String,
  sold: Boolean,
  dateOfSale: String,
  image: String
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
