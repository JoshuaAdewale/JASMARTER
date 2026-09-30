const router = require('express').Router();
const ctl = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/create-intent', authMiddleware, ctl.createIntent);
router.post('/confirm',       authMiddleware, ctl.confirm);

// Note: webhook route is mounted BEFORE express.json() in production
// (would need a separate raw-body parser setup). For MVP, this is a placeholder.
router.post('/webhook', ctl.webhook);

module.exports = router;
