const mongoose = require('mongoose');

/**
 * Lease schema - links a tenant to a property for a term.
 *
 * Lifecycle: pending → approved | rejected | active → terminated | completed
 */
const leaseSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    tenant:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true, index: true },
    owner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },

    startDate:   { type: Date, required: true },
    endDate:     { type: Date, required: true },
    monthlyRent: { type: Number, required: true, min: 0 },
    deposit:     { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'terminated', 'completed'],
      default: 'pending',
      index: true,
    },

    message: { type: String }, // tenant's application message

    paymentHistory: [
      {
        amount:    { type: Number, required: true },
        paidAt:    { type: Date, default: Date.now },
        stripePaymentIntentId: { type: String },
        status:    { type: String, enum: ['succeeded', 'pending', 'failed'], default: 'pending' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lease', leaseSchema);
