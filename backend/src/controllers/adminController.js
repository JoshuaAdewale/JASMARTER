const User = require('../models/User');
const Property = require('../models/Property');
const Lease = require('../models/Lease');
const MaintenanceRequest = require('../models/MaintenanceRequest');

exports.dashboard = async (_req, res, next) => {
  try {
    const [users, properties, leases, openMaintenance] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Lease.countDocuments(),
      MaintenanceRequest.countDocuments({ status: { $in: ['open', 'scheduled', 'in_progress'] } }),
    ]);

    const leasesByStatus = await Lease.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      counts: { users, properties, leases, openMaintenance },
      leasesByStatus,
    });
  } catch (err) { next(err); }
};

exports.transactions = async (_req, res, next) => {
  try {
    const leases = await Lease.find({ 'paymentHistory.0': { $exists: true } })
      .populate('tenant', 'firstName lastName email')
      .populate('property', 'title')
      .sort('-updatedAt')
      .limit(100);
    const transactions = leases.flatMap((l) =>
      l.paymentHistory.map((p) => ({
        leaseId: l._id,
        tenant: l.tenant,
        property: l.property,
        amount: p.amount,
        status: p.status,
        paidAt: p.paidAt,
        stripePaymentIntentId: p.stripePaymentIntentId,
      }))
    );
    res.json(transactions);
  } catch (err) { next(err); }
};
