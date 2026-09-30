const { validationResult } = require('express-validator');

/**
 * Express middleware that returns 400 if any express-validator
 * chain has flagged the request.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validate;
