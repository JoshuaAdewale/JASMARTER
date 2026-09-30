const User = require('../models/User');
const { HttpError } = require('../middleware/errorMiddleware');

exports.listUsers = async (req, res, next) => {
  try {
    const { role, q } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) {
      filter.$or = [
        { firstName: new RegExp(q, 'i') },
        { lastName:  new RegExp(q, 'i') },
        { email:     new RegExp(q, 'i') },
      ];
    }
    const users = await User.find(filter).sort('-createdAt');
    res.json(users);
  } catch (err) { next(err); }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new HttpError(404, 'User not found');
    res.json(user);
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const allowed = ['firstName', 'lastName', 'phone', 'avatarUrl'];
    const patch = {};
    for (const k of allowed) if (req.body[k] !== undefined) patch[k] = req.body[k];
    const user = await User.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!user) throw new HttpError(404, 'User not found');
    res.json(user);
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new HttpError(404, 'User not found');
    res.json({ ok: true });
  } catch (err) { next(err); }
};
