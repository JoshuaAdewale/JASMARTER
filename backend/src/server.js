/**
 * JASMARTA API entry point.
 * Loads env, connects to Mongo, mounts routes, starts Express.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// --- Security & parsing ---
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Rate limiting on auth endpoints ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later.' },
});

// --- Health check ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'jasmarta-api', time: new Date().toISOString() });
});

// --- Mount routes ---
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/leases', require('./routes/leaseRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// --- 404 + global error handler ---
app.use(notFound);
app.use(errorHandler);

// --- Boot ---
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 JASMARTA API running on http://localhost:${PORT}`);
      console.log(`   Auth provider: ${process.env.AUTH_PROVIDER || 'jwt'}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  });

module.exports = app;
