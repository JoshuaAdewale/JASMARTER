const mongoose = require('mongoose');

/**
 * In-app notification record. Push delivery handled separately.
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['lease_update', 'payment', 'maintenance', 'system'],
      default: 'system',
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    data:    { type: mongoose.Schema.Types.Mixed },
    isRead:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
