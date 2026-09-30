/**
 * Custom error class so controllers can throw with HTTP status codes
 * and have them translated to JSON by the global handler.
 */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function notFound(req, res, _next) {
  res.status(404).json({ error: `Not found: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const payload = { error: err.message || 'Internal server error' };

  if (process.env.NODE_ENV !== 'production' && status >= 500) {
    payload.stack = err.stack;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: Object.values(err.errors).map((e) => e.message),
    });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key', field: Object.keys(err.keyValue)[0] });
  }

  console.error(`[${status}] ${err.message}`);
  res.status(status).json(payload);
}

module.exports = { HttpError, notFound, errorHandler };
