const mongoose = require('mongoose');

/**
 * Maintenance Request schema - tracks repairs/cleaning for a property.
 */
const maintenanceSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    lease:    { type: mongoose.Schema.Types.ObjectId, ref: 'Lease' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['plumbing', 'electrical', 'cleaning', 'hvac', 'security', 'other'],
      default: 'other',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'scheduled', 'in_progress', 'resolved', 'cancelled'],
      default: 'open',
      index: true,
    },
    scheduledFor: { type: Date },
    resolvedAt:   { type: Date },
    cost:         { type: Number, default: 0, min: 0 },
    notes:        { type: String },
    photos:       [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenanceRequest', maintenanceSchema);
