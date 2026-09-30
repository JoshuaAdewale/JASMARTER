/**
 * Seed script — populates Mongo with sample users, properties, leases,
 * and a maintenance request. Useful for first-time setup and demos.
 *
 * Run: npm run seed --workspace backend
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Property = require('../models/Property');
const Lease = require('../models/Lease');
const MaintenanceRequest = require('../models/MaintenanceRequest');

(async () => {
  await connectDB();

  console.log('🧹 Wiping collections...');
  await Promise.all([User.deleteMany({}), Property.deleteMany({}), Lease.deleteMany({}), MaintenanceRequest.deleteMany({})]);

  console.log('👥 Creating users...');
  const [admin, owner, tenant] = await User.create([
    { firstName: 'Ada',    lastName: 'Admin',   email: 'admin@jasmarta.app',   password: 'password', role: 'admin'  },
    { firstName: 'Olivia', lastName: 'Owner',   email: 'owner@jasmarta.app',   password: 'password', role: 'owner'  },
    { firstName: 'Tunde',  lastName: 'Tenant',  email: 'tenant@jasmarta.app',  password: 'password', role: 'tenant' },
  ]);

  console.log('🏠 Creating properties...');
  const [p1, p2] = await Property.create([
    {
      owner: owner._id,
      title: 'Modern 2BR Apartment in Lekki',
      description: 'Bright, recently renovated apartment close to the beach. Comes with 24/7 power and security.',
      address: { street: '24 Admiralty Way', city: 'Lagos', state: 'Lagos', country: 'Nigeria', postalCode: '101245' },
      propertyType: 'apartment',
      bedrooms: 2, bathrooms: 2, sizeSqFt: 1100,
      rentAmount: 1500, currency: 'USD',
      photos: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200'],
      amenities: ['wifi', 'parking', 'security', '24/7 power'],
    },
    {
      owner: owner._id,
      title: 'Cozy Studio in Brooklyn',
      description: 'Compact studio in trendy Williamsburg. Walking distance to cafes and subway.',
      address: { street: '88 N 6th St', city: 'Brooklyn', state: 'NY', country: 'USA', postalCode: '11249' },
      propertyType: 'studio',
      bedrooms: 0, bathrooms: 1, sizeSqFt: 480,
      rentAmount: 2200, currency: 'USD',
      photos: ['https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200'],
      amenities: ['wifi', 'laundry'],
    },
  ]);

  console.log('📄 Creating lease + maintenance...');
  await Lease.create({
    property: p1._id, tenant: tenant._id, owner: owner._id,
    startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    monthlyRent: 1500, deposit: 1500,
    status: 'pending', message: 'I would love to lease this apartment for a year.',
  });

  await MaintenanceRequest.create({
    property: p1._id,
    reportedBy: tenant._id,
    title: 'Leaking kitchen faucet',
    description: 'The cold-water tap drips constantly.',
    category: 'plumbing', priority: 'medium', status: 'open',
  });

  console.log('\n✅ Seed complete. Sample logins:');
  console.log('   admin@jasmarta.app  / password');
  console.log('   owner@jasmarta.app  / password');
  console.log('   tenant@jasmarta.app / password');

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
