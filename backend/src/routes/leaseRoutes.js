const router = require('express').Router();
const ctl = require('../controllers/leaseController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.post('/apply/:propertyId', authMiddleware, requireRole('tenant'), ctl.apply);
router.get('/mine',       authMiddleware, ctl.listMine);
router.get('/:id',        authMiddleware, ctl.getOne);
router.post('/:id/decision', authMiddleware, requireRole('owner', 'admin'), ctl.decide);
router.post('/:id/terminate', authMiddleware, ctl.terminate);

module.exports = router;
