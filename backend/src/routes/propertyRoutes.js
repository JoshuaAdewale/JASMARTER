const router = require('express').Router();
const ctl = require('../controllers/propertyController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

// Public reads
router.get('/', ctl.list);
router.get('/:id', ctl.getOne);

// Authenticated writes
router.post('/',      authMiddleware, requireRole('owner', 'admin'), ctl.create);
router.get('/mine/list', authMiddleware, requireRole('owner', 'admin'), ctl.myProperties);
router.put('/:id',    authMiddleware, ctl.update);
router.delete('/:id', authMiddleware, ctl.remove);

module.exports = router;
