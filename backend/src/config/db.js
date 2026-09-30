/**
 * Mongo connection helper.
 */
const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env');

  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () =>
    console.log('✅ MongoDB connected')
  );
  mongoose.connection.on('error', (err) =>
    console.error('❌ MongoDB error:', err.message)
  );
  mongoose.connection.on('disconnected', () =>
    console.warn('⚠️  MongoDB disconnected')
  );

  await mongoose.connect(uri);
}

module.exports = connectDB;
