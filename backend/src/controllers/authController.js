const { body } = require('express-validator');
const { getProvider } = require('../services/authService');

exports.registerRules = [
  body('firstName').isString().trim().notEmpty().withMessage('First name required'),
  body('lastName').isString().trim().notEmpty().withMessage('Last name required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be ≥ 6 chars'),
  body('role').optional().isIn(['owner', 'tenant']),
];

exports.loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
];

exports.register = async (req, res, next) => {
  try {
    const provider = getProvider();
    const { firstName, lastName, email, password, role } = req.body;
    const { user, token } = await provider.register({ firstName, lastName, email, password, role });
    res.status(201).json({ user, token });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const provider = getProvider();
    const { user, token } = await provider.login(req.body);
    res.json({ user, token });
  } catch (err) { next(err); }
};

exports.firebaseLogin = async (req, res, next) => {
  try {
    if ((process.env.AUTH_PROVIDER || 'jwt').toLowerCase() !== 'firebase') {
      return res.status(400).json({ error: 'Firebase auth is not enabled on this server' });
    }
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });
    const { user, token } = await getProvider().loginWithIdToken(idToken);
    res.json({ user, token });
  } catch (err) { next(err); }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
