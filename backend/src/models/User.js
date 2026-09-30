const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User schema - represents Property Owners, Tenants, and Admins.
 *
 * Roles:
 *  - "owner"   → lists and manages properties
 *  - "tenant"  → browses properties, applies for leases, pays rent
 *  - "admin"   → oversees the platform
 */
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    password:  { type: String, minlength: 6, select: false }, // optional when using Firebase
    role: {
      type: String,
      enum: ['owner', 'tenant', 'admin'],
      default: 'tenant',
      index: true,
    },
    phone:      { type: String, trim: true },
    avatarUrl:  { type: String },
    firebaseUid:{ type: String, index: true, sparse: true }, // populated when using Firebase
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

// --- Hash password if modified ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// --- Compare password helper ---
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
