const Stripe = require('stripe');
const Lease = require('../models/Lease');
const { HttpError } = require('../middleware/errorMiddleware');
const { notify } = require('../services/notificationService');

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

/**
 * POST /api/payments/create-intent
 * Body: { leaseId, amount }
 * Creates a Stripe PaymentIntent for rent collection.
 */
exports.createIntent = async (req, res, next) => {
  try {
    if (!stripe) throw new HttpError(500, 'Stripe not configured');
    const { leaseId, amount } = req.body;
    const lease = await Lease.findById(leaseId);
    if (!lease) throw new HttpError(404, 'Lease not found');
    if (!lease.tenant.equals(req.user._id)) throw new HttpError(403, 'Not your lease');

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount) * 100), // cents
      currency: 'usd',
      metadata: { leaseId: lease._id.toString(), tenantId: req.user._id.toString() },
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
  } catch (err) { next(err); }
};

/**
 * POST /api/payments/confirm
 * Body: { leaseId, paymentIntentId, status }
 * Called from the client after Stripe confirms on the frontend.
 */
exports.confirm = async (req, res, next) => {
  try {
    const { leaseId, paymentIntentId, status } = req.body;
    const lease = await Lease.findById(leaseId);
    if (!lease) throw new HttpError(404, 'Lease not found');

    lease.paymentHistory.push({
      amount: 0, // real amount comes from Stripe in production; client sends it here in MVP
      stripePaymentIntentId: paymentIntentId,
      status: status || 'succeeded',
    });

    if (lease.status === 'approved') lease.status = 'active';
    await lease.save();

    await notify({
      recipient: lease.owner,
      type: 'payment',
      title: 'Rent received',
      message: `Tenant paid for lease ${lease._id}.`,
      data: { leaseId: lease._id, paymentIntentId },
    });

    res.json(lease);
  } catch (err) { next(err); }
};

/**
 * Stripe webhook for production-grade payment events.
 * Configure in Stripe dashboard: /api/payments/webhook
 */
exports.webhook = async (req, res) => {
  if (!stripe) return res.status(500).end();
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log('Stripe webhook event:', event.type);
  // Real implementations would update lease.paymentHistory here.
  res.json({ received: true });
};
