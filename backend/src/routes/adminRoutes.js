const router = require('express').Router();
const ctl = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.get('/dashboard',    authMiddleware, requireRole('admin'), ctl.dashboard);
router.get('/transactions',  authMiddleware, requireRole('admin'), ctl.transactions);

module.exports = router;
