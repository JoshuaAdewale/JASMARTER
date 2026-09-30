const router = require('express').Router();
const ctl = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');

router.get('/',       authMiddleware, requireRole('admin'), ctl.listUsers);
router.get('/:id',    authMiddleware, ctl.getUser);
router.put('/:id',    authMiddleware, ctl.updateUser);
router.delete('/:id', authMiddleware, requireRole('admin'), ctl.deleteUser);

module.exports = router;
