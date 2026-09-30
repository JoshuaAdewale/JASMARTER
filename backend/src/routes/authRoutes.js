const router = require('express').Router();
const ctl = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/register', ctl.registerRules, validate, ctl.register);
router.post('/login',    ctl.loginRules,    validate, ctl.login);
router.post('/firebase-login', ctl.firebaseLogin);
router.get('/me',        authMiddleware, ctl.me);

module.exports = router;
