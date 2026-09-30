const MaintenanceRequest = require('../models/MaintenanceRequest');
const Property = require('../models/Property');
const { HttpError } = require('../middleware/errorMiddleware');
const { notify } = require('../services/notificationService');

exports.create = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) throw new HttpError(404, 'Property not found');

    const request = await MaintenanceRequest.create({
      ...req.body,
      property: property._id,
      reportedBy: req.user._id,
    });

    await notify({
      recipient: property.owner,
      type: 'maintenance',
      title: 'New maintenance request',
      message: `${req.body.title} reported for "${property.title}".`,
      data: { requestId: request._id },
    });

    res.status(201).json(request);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.propertyId) filter.property = req.query.propertyId;
    if (req.query.status)     filter.status   = req.query.status;
    if (req.user.role === 'owner')   filter.property = { $in: (await Property.find({ owner: req.user._id })).map((p) => p._id) };
    if (req.user.role === 'tenant')  filter.reportedBy = req.user._id;

    const requests = await MaintenanceRequest.find(filter)
      .populate('property', 'title address')
      .populate('reportedBy', 'firstName lastName')
      .sort('-createdAt');
    res.json(requests);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id).populate('property');
    if (!request) throw new HttpError(404, 'Request not found');
    if (request.property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw new HttpError(403, 'Only the owner can update maintenance status');
    }
    Object.assign(request, req.body);
    if (req.body.status === 'resolved' && !request.resolvedAt) request.resolvedAt = new Date();
    await request.save();
    res.json(request);
  } catch (err) { next(err); }
};
