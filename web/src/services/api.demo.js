/**
 * Offline demo API.
 *
 * Drop-in replacement for `services/api.js` used ONLY in the single-file demo build
 * (see vite.config.demo.js → alias). It answers the same endpoints the app calls,
 * with the same response shapes, so every screen, form and button in the real UI
 * works without a server or database.
 *
 * State lives in localStorage, so actions (adding a property, approving a lease,
 * reporting an issue) persist across reloads. Reset with the banner button.
 */
import lekkiImg from '../assets/demo/lekki.jpg';
import brooklynImg from '../assets/demo/brooklyn.jpg';
import heroImg from '../assets/demo/hero.jpg';

const DB_KEY = 'jasmarta_demo_db_v1';
const TOKEN_KEY = 'jasmarta_token';
const LATENCY = 140;

const uid = (p) => `${p}${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16).slice(-6)}`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clone = (v) => JSON.parse(JSON.stringify(v));

/* ────────────────────────────── seed data ────────────────────────────── */
function seed() {
  const owner = { _id: 'u_owner', firstName: 'Olivia', lastName: 'Owner', email: 'owner@jasmarta.app', role: 'owner', phone: '+1 416 555 0110' };
  const tenant = { _id: 'u_tenant', firstName: 'Tunde', lastName: 'Tenant', email: 'tenant@jasmarta.app', role: 'tenant', phone: '+234 803 555 4412' };
  const admin = { _id: 'u_admin', firstName: 'Ada', lastName: 'Admin', email: 'admin@jasmarta.app', role: 'admin' };

  const p1 = {
    _id: 'p_lekki',
    title: 'Modern 2BR Apartment in Lekki',
    description:
      'Fully serviced apartment a short drive from Admiralty Way. Fitted kitchen, inverter power backup, ' +
      'gated compound with 24/7 security, and a balcony overlooking the estate. Ideal for a professional ' +
      'relocating to Lagos — the owner lives abroad and manages everything through JASMARTA.',
    propertyType: 'apartment',
    rentAmount: 1500,
    currency: 'USD',
    address: { street: '24 Admiralty Way', city: 'Lagos', state: 'Lagos', country: 'Nigeria', postalCode: '101245' },
    bedrooms: 2, bathrooms: 2, sizeSqFt: 980,
    amenities: ['wifi', 'parking', 'security', '24/7 power'],
    status: 'available',
    photos: [lekkiImg],
    owner: owner._id,
    createdAt: '2026-09-12T09:00:00.000Z',
  };

  const p2 = {
    _id: 'p_brooklyn',
    title: 'Cozy Studio in Brooklyn',
    description:
      'Bright studio in Williamsburg with exposed brick, a compact kitchen and laundry in the building. ' +
      'Two blocks from the L train; the owner relocated to Lisbon and rents it fully furnished.',
    propertyType: 'studio',
    rentAmount: 2200,
    currency: 'USD',
    address: { street: '88 N 6th St', city: 'Brooklyn', state: 'NY', country: 'USA', postalCode: '11249' },
    bedrooms: 1, bathrooms: 1, sizeSqFt: 460,
    amenities: ['wifi', 'laundry'],
    status: 'available',
    photos: [brooklynImg],
    owner: owner._id,
    createdAt: '2026-09-18T09:00:00.000Z',
  };

  const lease = {
    _id: 'l_pending',
    property: p2._id,
    tenant: tenant._id,
    owner: owner._id,
    startDate: '2026-11-15',
    endDate: '2027-11-14',
    monthlyRent: 2200,
    deposit: 2200,
    message: "I'm relocating from Accra for work and can provide employer references.",
    status: 'pending',
    paymentHistory: [],
    createdAt: '2026-09-20T10:30:00.000Z',
  };

  const maint = {
    _id: 'm_faucet',
    property: p1._id,
    reportedBy: tenant._id,
    title: 'Leaking kitchen faucet',
    description: 'The cold-water tap drips constantly and the cabinet underneath stays damp.',
    category: 'plumbing',
    priority: 'medium',
    status: 'open',
    assignedTo: '',
    scheduledFor: null,
    createdAt: '2026-09-25T08:15:00.000Z',
  };

  return {
    users: [admin, owner, tenant],
    passwords: { [owner.email]: 'password', [tenant.email]: 'password', [admin.email]: 'password' },
    properties: [p1, p2],
    leases: [lease],
    maintenance: [maint],
  };
}

/* ────────────────────────────── storage ────────────────────────────── */
function load() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const fresh = seed();
  save(fresh);
  return fresh;
}
function save(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)); } catch { /* ignore */ }
}
export function resetDemo() {
  localStorage.removeItem(DB_KEY);
  localStorage.removeItem(TOKEN_KEY);
}
let db = load();
const commit = () => save(db);

/* ────────────────────────────── helpers ────────────────────────────── */
function currentUser() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token || !token.startsWith('demo.')) return null;
  const id = token.slice(5);
  return db.users.find((u) => u._id === id) || null;
}
const publicUser = (u) => (u ? { ...u } : null);
const findProp = (id) => db.properties.find((p) => p._id === id);
const hydrate = (lease) => ({
  ...clone(lease),
  property: clone(findProp(lease.property) || {}),
  tenant: publicUser(db.users.find((u) => u._id === lease.tenant)),
  owner: publicUser(db.users.find((u) => u._id === lease.owner)),
});

function ok(data) { return { data: clone(data), status: 200, statusText: 'OK' }; }
function fail(status, error) {
  const err = new Error(error);
  err.response = { status, data: { error } };
  throw err;
}

/* ────────────────────────────── routes ────────────────────────────── */
async function route(method, url, body, config) {
  await wait(LATENCY);
  const [path] = url.split('?');
  const params = config?.params || (url.includes('?') ? Object.fromEntries(new URLSearchParams(url.split('?')[1])) : {});
  const seg = path.split('/').filter(Boolean);
  const me = currentUser();

  /* ---- auth ---- */
  if (path === '/auth/login' && method === 'post') {
    const { email, password } = body || {};
    const user = db.users.find((u) => u.email === String(email).toLowerCase().trim());
    if (!user || db.passwords[user.email] !== password) fail(401, 'Invalid email or password');
    return ok({ user: publicUser(user), token: `demo.${user._id}` });
  }

  if (path === '/auth/register' && method === 'post') {
    const { firstName, lastName, email, password, role } = body || {};
    if (!firstName || !lastName || !email || !password) fail(400, 'All fields are required');
    if (String(password).length < 6) fail(400, 'Password must be at least 6 characters');
    if (db.users.some((u) => u.email === String(email).toLowerCase())) fail(409, 'That email is already registered');
    const user = {
      _id: uid('u_'), firstName, lastName,
      email: String(email).toLowerCase(), password,
      role: ['owner', 'tenant'].includes(role) ? role : 'tenant',
    };
    db.users.push(user);
    db.passwords[user.email] = password;
    commit();
    return ok({ user: publicUser(user), token: `demo.${user._id}` });
  }

  if (path === '/auth/me' && method === 'get') {
    if (!me) fail(401, 'Not authorized');
    return ok({ user: publicUser(me) });
  }

  /* ---- public property feed ---- */
  if (path === '/properties' && method === 'get') {
    let list = db.properties.filter((p) => p.status !== 'unlisted');
    const { city, country, minRent, maxRent, q, type } = params;
    if (city) list = list.filter((p) => p.address.city.toLowerCase().includes(String(city).toLowerCase()));
    if (country) list = list.filter((p) => p.address.country.toLowerCase().includes(String(country).toLowerCase()));
    if (minRent) list = list.filter((p) => p.rentAmount >= Number(minRent));
    if (maxRent) list = list.filter((p) => p.rentAmount <= Number(maxRent));
    if (type) list = list.filter((p) => p.propertyType === type);
    if (q) {
      const needle = String(q).toLowerCase();
      list = list.filter((p) =>
        [p.title, p.description, p.address.city, p.address.country].join(' ').toLowerCase().includes(needle));
    }
    return ok(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((p) => ({
      ...clone(p), owner: publicUser(db.users.find((u) => u._id === p.owner)),
    })));
  }

  if (seg[0] === 'properties' && seg[1] === 'mine' && seg[2] === 'list') {
    if (!me?.role || !['owner', 'admin'].includes(me.role)) fail(403, 'Owners only');
    return ok(db.properties.filter((p) => p.owner === me._id || me.role === 'admin'));
  }

  /* ---- payments ---- */
  if (path === '/payments/create-intent' && method === 'post') {
    if (!me) fail(401, 'Not authorized');
    const lease = db.leases.find((l) => l._id === body?.leaseId);
    if (!lease) fail(404, 'Lease not found');
    if (lease.tenant !== me._id) fail(403, 'Not your lease');
    return ok({
      clientSecret: `demo_secret_${uid('')}`,
      paymentIntentId: `pi_demo_${uid('')}`,
      amount: Number(body.amount || lease.monthlyRent),
      demo: true,
    });
  }

  if (path === '/payments/confirm' && method === 'post') {
    if (!me) fail(401, 'Not authorized');
    const lease = db.leases.find((l) => l._id === body?.leaseId);
    if (!lease) fail(404, 'Lease not found');
    lease.paymentHistory.push({
      amount: lease.monthlyRent,
      stripePaymentIntentId: body.paymentIntentId || `pi_demo_${uid('')}`,
      status: 'succeeded',
      paidAt: new Date().toISOString(),
    });
    if (lease.status === 'approved') lease.status = 'active';
    commit();
    return ok(hydrate(lease));
  }

  /* ---- leases ---- */
  if (path === '/leases/mine' && method === 'get') {
    if (!me) fail(401, 'Not authorized');
    const mine = me.role === 'owner'
      ? db.leases.filter((l) => l.owner === me._id)
      : db.leases.filter((l) => l.tenant === me._id);
    return ok(mine.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(hydrate));
  }

  if (seg[0] === 'leases' && seg[1] === 'apply' && method === 'post') {
    if (!me) fail(401, 'Sign in to apply');
    if (me.role !== 'tenant') fail(403, 'Only tenants can apply for leases');
    const property = findProp(seg[2]);
    if (!property) fail(404, 'Property not found');
    if (property.status !== 'available') fail(400, 'Property is not available for lease');
    if (db.leases.some((l) => l.property === property._id && l.tenant === me._id && ['pending', 'active', 'approved'].includes(l.status))) {
      fail(409, 'You already have an open application for this property');
    }
    const lease = {
      _id: uid('l_'),
      property: property._id,
      tenant: me._id,
      owner: property.owner,
      startDate: body.startDate,
      endDate: body.endDate,
      monthlyRent: property.rentAmount,
      deposit: body.deposit || property.rentAmount,
      message: body.message || '',
      status: 'pending',
      paymentHistory: [],
      createdAt: new Date().toISOString(),
    };
    db.leases.push(lease);
    commit();
    return ok(hydrate(lease));
  }

  if (seg[0] === 'leases' && seg[2] === 'decision' && method === 'post') {
    if (!me) fail(401, 'Not authorized');
    const lease = db.leases.find((l) => l._id === seg[1]);
    if (!lease) fail(404, 'Lease not found');
    if (lease.owner !== me._id && me.role !== 'admin') fail(403, 'Only the owner can decide');
    const action = body?.action;
    if (!['approve', 'reject'].includes(action)) fail(400, 'action must be approve|reject');
    lease.status = action === 'approve' ? 'active' : 'rejected';
    const property = findProp(lease.property);
    if (property) property.status = action === 'approve' ? 'leased' : 'available';
    commit();
    return ok(hydrate(lease));
  }

  if (seg[0] === 'leases' && seg[2] === 'terminate' && method === 'post') {
    if (!me) fail(401, 'Not authorized');
    const lease = db.leases.find((l) => l._id === seg[1]);
    if (!lease) fail(404, 'Lease not found');
    if (lease.owner !== me._id && lease.tenant !== me._id && me.role !== 'admin') fail(403, 'Not your lease');
    lease.status = 'terminated';
    const property = findProp(lease.property);
    if (property) property.status = 'available';
    commit();
    return ok(hydrate(lease));
  }

  /* ---- maintenance ---- */
  if (path === '/maintenance' && method === 'get') {
    if (!me) fail(401, 'Not authorized');
    let list = db.maintenance;
    if (me.role === 'owner') {
      const owned = db.properties.filter((p) => p.owner === me._id).map((p) => p._id);
      list = list.filter((m) => owned.includes(m.property));
    } else if (me.role === 'tenant') {
      list = list.filter((m) => m.reportedBy === me._id);
    }
    return ok(list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((m) => ({
      ...clone(m),
      property: clone(findProp(m.property) || {}),
      reportedBy: publicUser(db.users.find((u) => u._id === m.reportedBy)),
    })));
  }

  if (seg[0] === 'maintenance' && seg.length === 2 && method === 'post') {
    if (!me) fail(401, 'Not authorized');
    const property = findProp(seg[1]);
    if (!property) fail(404, 'Property not found');
    const req = {
      _id: uid('m_'),
      property: property._id,
      reportedBy: me._id,
      title: body.title,
      description: body.description,
      category: body.category || 'other',
      priority: body.priority || 'medium',
      status: 'open',
      assignedTo: '',
      scheduledFor: null,
      createdAt: new Date().toISOString(),
    };
    db.maintenance.push(req);
    commit();
    return ok({ ...clone(req), property: clone(property), reportedBy: publicUser(me) });
  }

  if (seg[0] === 'maintenance' && seg.length === 2 && (method === 'put' || method === 'patch')) {
    if (!me) fail(401, 'Not authorized');
    const req = db.maintenance.find((m) => m._id === seg[1]);
    if (!req) fail(404, 'Request not found');
    const property = findProp(req.property);
    if (property?.owner !== me._id && me.role !== 'admin') fail(403, 'Only the owner can update maintenance status');
    Object.assign(req, body);
    if (body.status === 'resolved') req.resolvedAt = new Date().toISOString();
    commit();
    return ok({ ...clone(req), property: clone(property) });
  }

  /* ---- property detail + CRUD (must come after /properties/mine/list) ---- */
  if (seg[0] === 'properties' && seg.length === 2 && method === 'get') {
    const property = findProp(seg[1]);
    if (!property) fail(404, 'Property not found');
    return ok({ ...clone(property), owner: publicUser(db.users.find((u) => u._id === property.owner)) });
  }

  if (path === '/properties' && method === 'post') {
    if (!me) fail(401, 'Not authorized');
    if (!['owner', 'admin'].includes(me.role)) fail(403, 'Only owners can list properties');
    const property = {
      _id: uid('p_'),
      owner: me._id,
      currency: 'USD',
      status: 'available',
      photos: [heroImg],
      amenities: [],
      bedrooms: 0, bathrooms: 0, sizeSqFt: 0,
      createdAt: new Date().toISOString(),
      ...body,
    };
    db.properties.unshift(property);
    commit();
    return ok(property);
  }

  if (seg[0] === 'properties' && seg.length === 2 && (method === 'put' || method === 'patch')) {
    if (!me) fail(401, 'Not authorized');
    const property = findProp(seg[1]);
    if (!property) fail(404, 'Property not found');
    if (property.owner !== me._id && me.role !== 'admin') fail(403, 'Not your property');
    Object.assign(property, body);
    commit();
    return ok(property);
  }

  if (seg[0] === 'properties' && seg.length === 2 && method === 'delete') {
    if (!me) fail(401, 'Not authorized');
    const property = findProp(seg[1]);
    if (!property) fail(404, 'Property not found');
    if (property.owner !== me._id && me.role !== 'admin') fail(403, 'Not your property');
    db.properties = db.properties.filter((p) => p._id !== seg[1]);
    db.leases = db.leases.filter((l) => l.property !== seg[1]);
    commit();
    return ok({ deleted: true });
  }

  /* ---- admin ---- */
  if (path === '/admin/dashboard' && method === 'get') {
    if (me?.role !== 'admin') fail(403, 'Admin only');
    const counts = {
      users: db.users.length,
      properties: db.properties.length,
      leases: db.leases.length,
      openMaintenance: db.maintenance.filter((m) => m.status !== 'resolved').length,
    };
    const byStatus = {};
    db.leases.forEach((l) => { byStatus[l.status] = (byStatus[l.status] || 0) + 1; });
    return ok({ counts, leasesByStatus: Object.entries(byStatus).map(([_id, count]) => ({ _id, count })) });
  }

  if (path === '/admin/transactions' && method === 'get') {
    if (me?.role !== 'admin') fail(403, 'Admin only');
    const rows = [];
    db.leases.forEach((l) => l.paymentHistory.forEach((p) => rows.push({
      ...clone(p),
      property: clone(findProp(l.property) || {}),
      tenant: publicUser(db.users.find((u) => u._id === l.tenant)),
    })));
    return ok(rows);
  }

  if (path === '/users' && method === 'get') {
    if (me?.role !== 'admin') fail(403, 'Admin only');
    return ok(db.users.map(publicUser));
  }

  /* ---- fallback ---- */
  console.warn('[demo-api] no handler for', method.toUpperCase(), path);
  return ok([]);
}

/* ────────────────────── axios-compatible surface ────────────────────── */
const api = {
  get: (url, config) => route('get', url, null, config),
  post: (url, body, config) => route('post', url, body, config),
  put: (url, body, config) => route('put', url, body, config),
  patch: (url, body, config) => route('patch', url, body, config),
  delete: (url, config) => route('delete', url, null, config),
  defaults: { baseURL: 'demo://offline' },
  // the real api.js registers interceptors; no-ops here so nothing breaks
  interceptors: { request: { use: () => {} }, response: { use: () => {} } },
};

export default api;
