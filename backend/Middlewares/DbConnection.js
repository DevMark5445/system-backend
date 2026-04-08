const mongoose = require ('mongoose');

mongoose.connect(process.env.MONGODB_URI, {dbname: process.env.DB_NAME})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));