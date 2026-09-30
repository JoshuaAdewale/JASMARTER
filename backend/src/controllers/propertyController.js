const Property = require('../models/Property');
const { HttpError } = require('../middleware/errorMiddleware');

/**
 * GET /api/properties
 * Public list with optional filters: city, country, minRent, maxRent, q, type, status
 */
exports.list = async (req, res, next) => {
  try {
    const { city, country, q, type, status, minRent, maxRent } = req.query;
    const filter = {};
    if (city)    filter['address.city']    = new RegExp(city, 'i');
    if (country) filter['address.country'] = new RegExp(country, 'i');
    if (type)    filter.propertyType      = type;
    if (status)  filter.status            = status;
    if (minRent) filter.rentAmount        = { ...(filter.rentAmount || {}), $gte: Number(minRent) };
    if (maxRent) filter.rentAmount        = { ...(filter.rentAmount || {}), $lte: Number(maxRent) };
    if (q)       filter.$text             = { $search: q };

    const properties = await Property.find(filter)
      .populate('owner', 'firstName lastName email')
      .sort('-createdAt')
      .limit(100);
    res.json(properties);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'firstName lastName email');
    if (!property) throw new HttpError(404, 'Property not found');
    res.json(property);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const property = await Property.create({ ...req.body, owner: req.user._id });
    res.status(201).json(property);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) throw new HttpError(404, 'Property not found');
    if (!property.owner.equals(req.user._id) && req.user.role !== 'admin') {
      throw new HttpError(403, 'Not your property');
    }
    Object.assign(property, req.body);
    await property.save();
    res.json(property);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) throw new HttpError(404, 'Property not found');
    if (!property.owner.equals(req.user._id) && req.user.role !== 'admin') {
      throw new HttpError(403, 'Not your property');
    }
    await property.deleteOne();
    res.json({ ok: true });
  } catch (err) { next(err); }
};

exports.myProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort('-createdAt');
    res.json(properties);
  } catch (err) { next(err); }
};
