const router = require('express').Router();
const ctl = require('../controllers/maintenanceController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/:propertyId', authMiddleware, ctl.create);
router.get('/',             authMiddleware, ctl.list);
router.put('/:id',          authMiddleware, ctl.update);

module.exports = router;
