const mongoose = require('mongoose');

/**
 * Property schema - a real estate listing owned by a User (role=owner).
 */
const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true },
    address: {
      street:     { type: String, required: true },
      city:       { type: String, required: true, index: true },
      state:      { type: String },
      country:    { type: String, required: true, index: true },
      postalCode: { type: String },
    },
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'condo', 'commercial', 'studio', 'other'],
      default: 'apartment',
    },
    bedrooms:  { type: Number, default: 1, min: 0 },
    bathrooms: { type: Number, default: 1, min: 0 },
    sizeSqFt:  { type: Number, min: 0 },
    rentAmount: { type: Number, required: true, min: 0 }, // per month
    currency:   { type: String, default: 'USD' },
    photos:     [{ type: String }], // URLs
    amenities:  [{ type: String }], // ["wifi","parking","pool",...]
    status: {
      type: String,
      enum: ['available', 'leased', 'under_maintenance', 'unlisted'],
      default: 'available',
      index: true,
    },
    availableFrom: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

propertySchema.index({ title: 'text', description: 'text', 'address.city': 'text' });

module.exports = mongoose.model('Property', propertySchema);
