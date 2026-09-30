const Lease = require('../models/Lease');
const Property = require('../models/Property');
const { HttpError } = require('../middleware/errorMiddleware');
const { notify } = require('../services/notificationService');

/**
 * Tenant applies for a lease on a property.
 */
exports.apply = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) throw new HttpError(404, 'Property not found');
    if (property.status !== 'available') {
      throw new HttpError(400, 'Property is not available for lease');
    }

    const { startDate, endDate, message } = req.body;
    const lease = await Lease.create({
      property:   property._id,
      tenant:     req.user._id,
      owner:      property.owner,
      startDate, endDate,
      monthlyRent: property.rentAmount,
      deposit:     req.body.deposit || property.rentAmount,
      message,
    });

    await notify({
      recipient: property.owner,
      type: 'lease_update',
      title: 'New lease application',
      message: `${req.user.firstName} ${req.user.lastName} applied for "${property.title}".`,
      data: { leaseId: lease._id },
    });

    res.status(201).json(lease);
  } catch (err) { next(err); }
};

exports.listMine = async (req, res, next) => {
  try {
    // tenants see their own; owners see leases on their properties
    const filter = req.user.role === 'owner'
      ? { owner: req.user._id }
      : { tenant: req.user._id };
    const leases = await Lease.find(filter)
      .populate('property', 'title address rentAmount photos')
      .populate('tenant', 'firstName lastName email')
      .sort('-createdAt');
    res.json(leases);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.id)
      .populate('property')
      .populate('tenant', 'firstName lastName email')
      .populate('owner',   'firstName lastName email');
    if (!lease) throw new HttpError(404, 'Lease not found');
    res.json(lease);
  } catch (err) { next(err); }
};

exports.decide = async (req, res, next) => {
  try {
    const { action } = req.body; // "approve" | "reject"
    if (!['approve', 'reject'].includes(action)) throw new HttpError(400, 'action must be approve|reject');

    const lease = await Lease.findById(req.params.id).populate('property');
    if (!lease) throw new HttpError(404, 'Lease not found');
    if (!lease.owner.equals(req.user._id) && req.user.role !== 'admin') {
      throw new HttpError(403, 'Only the owner can decide');
    }

    lease.status = action === 'approve' ? 'approved' : 'rejected';
    await lease.save();

    if (action === 'approve') {
      lease.property.status = 'leased';
      await lease.property.save();
    }

    await notify({
      recipient: lease.tenant,
      type: 'lease_update',
      title: `Lease ${action}d`,
      message: `Your application for "${lease.property.title}" was ${action}d.`,
      data: { leaseId: lease._id },
    });

    res.json(lease);
  } catch (err) { next(err); }
};

exports.terminate = async (req, res, next) => {
  try {
    const lease = await Lease.findById(req.params.id).populate('property');
    if (!lease) throw new HttpError(404, 'Lease not found');
    if (!lease.owner.equals(req.user._id) && !lease.tenant.equals(req.user._id) && req.user.role !== 'admin') {
      throw new HttpError(403, 'Not allowed');
    }
    lease.status = 'terminated';
    await lease.save();
    lease.property.status = 'available';
    await lease.property.save();
    res.json(lease);
  } catch (err) { next(err); }
};
