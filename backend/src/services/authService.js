/**
 * Auth strategy selector.
 *
 * Reads AUTH_PROVIDER from .env and routes auth operations to the
 * appropriate implementation:
 *
 *   - "jwt"      → uses local email/password with bcrypt + jsonwebtoken
 *   - "firebase" → verifies Firebase ID tokens via firebase-admin
 *
 * Both paths produce the same `AuthenticatedUser` shape so the rest
 * of the codebase doesn't care which is active.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function verifyJwt(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

/**
 * JWT provider - local email/password.
 */
const jwtProvider = {
  async register({ firstName, lastName, email, password, role }) {
    const existing = await User.findOne({ email });
    if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });

    const user = await User.create({ firstName, lastName, email, password, role });
    return { user, token: signToken(user) };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const ok = await user.comparePassword(password);
    if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    return { user, token: signToken(user) };
  },

  async verifyToken(token) {
    const decoded = verifyJwt(token);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw Object.assign(new Error('Invalid token'), { status: 401 });
    return user;
  },
};

/**
 * Firebase provider - verifies ID tokens issued by Firebase Auth.
 * Requires FIREBASE_* env vars to be set.
 *
 * Users signing in with Firebase are upserted into our User collection
 * on first login, keyed by `firebaseUid`.
 */
let firebaseProvider;
function getFirebaseProvider() {
  if (firebaseProvider) return firebaseProvider;

  // Lazy-require so projects that don't use Firebase don't crash on missing deps
  const admin = require('firebase-admin');

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
  }

  firebaseProvider = {
    async register() { throw new Error('Use the Firebase client SDK to register, then call /api/auth/firebase-login'); },
    async login()    { throw new Error('Use the Firebase client SDK to login, then call /api/auth/firebase-login'); },

    async loginWithIdToken(idToken) {
      const decoded = await admin.auth().verifyIdToken(idToken);
      const { uid, email, name, picture } = decoded;

      const [firstName, ...rest] = (name || '').split(' ');
      const lastName = rest.join(' ') || 'User';

      const user = await User.findOneAndUpdate(
        { firebaseUid: uid },
        {
          $set: {
            firebaseUid: uid,
            email,
            firstName: firstName || email.split('@')[0],
            lastName,
            avatarUrl: picture,
          },
          $setOnInsert: { role: 'tenant', isActive: true },
        },
        { upsert: true, new: true }
      );
      return { user, token: signToken(user) };
    },

    async verifyToken(token) {
      // If a JWT we issued is presented, validate it; otherwise treat as Firebase ID token.
      try {
        return await jwtProvider.verifyToken(token);
      } catch {
        return (await getFirebaseProvider().loginWithIdToken(token)).user;
      }
    },
  };
  return firebaseProvider;
}

function getProvider() {
  const provider = (process.env.AUTH_PROVIDER || 'jwt').toLowerCase();
  if (provider === 'firebase') return getFirebaseProvider();
  return jwtProvider;
}

module.exports = { getProvider, signToken };
