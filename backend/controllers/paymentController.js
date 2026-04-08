const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const ErrorHandler = require("../utils/errorHandler");
const Payment = require("../models/paymentModel");
const User = require("../models/userModel");

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  // eslint-disable-next-line global-require
  return require("stripe")(key);
};

exports.sendStripeApiKey = asyncErrorHandler(async (req, res, next) => {
  const publishable =
    process.env.STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_API_KEY;
  if (!publishable) {
    return next(
      new ErrorHandler(
        "STRIPE_PUBLISHABLE_KEY (or STRIPE_API_KEY) is not set",
        500,
      ),
    );
  }
  res.status(200).json({
    stripeApiKey: publishable,
  });
});

async function getOrCreateStripeCustomer(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new ErrorHandler("User not found", 404);
    throw err;
  }
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }
  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user._id.toString() },
  });
  await User.findByIdAndUpdate(userId, {
    stripeCustomerId: customer.id,
  });
  return customer.id;
}

exports.processPayment = asyncErrorHandler(async (req, res, next) => {
  const { amount, saveCard } = req.body;
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) {
    return next(new ErrorHandler("Invalid amount", 400));
  }
  const amountMinor = Math.round(num * 100);
  if (amountMinor < 100) {
    return next(
      new ErrorHandler(
        "Amount must be at least PKR 1.00 (Stripe minimum for this currency)",
        400,
      ),
    );
  }

  const stripe = getStripe();
  const customerId = await getOrCreateStripeCustomer(req.user._id);

  const intentParams = {
    amount: amountMinor,
    currency: "pkr",
    payment_method_types: ["card"],
    customer: customerId,
    metadata: {
      userId: req.user._id.toString(),
    },
  };

  if (saveCard === true) {
    intentParams.setup_future_usage = "on_session";
  }

  const paymentIntent = await stripe.paymentIntents.create(intentParams);

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

/** Saved cards (card brand + last4 only —) */
exports.listPaymentMethods = asyncErrorHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || !user.stripeCustomerId) {
    return res.status(200).json({ paymentMethods: [] });
  }

  const stripe = getStripe();
  const list = await stripe.paymentMethods.list({
    customer: user.stripeCustomerId,
    type: "card",
  });

  const paymentMethods = list.data.map((pm) => ({
    id: pm.id,
    brand: pm.card.brand,
    last4: pm.card.last4,
    expMonth: pm.card.exp_month,
    expYear: pm.card.exp_year,
  }));

  res.status(200).json({ paymentMethods });
});

exports.paytmResponse = (req, res) => {
  res.status(410).send("Paytm checkout is disabled. Use Stripe checkout.");
};

exports.getPaymentStatus = asyncErrorHandler(async (req, res, next) => {
  const payment = await Payment.findOne({ orderId: req.params.id });

  if (!payment) {
    return next(new ErrorHandler("Payment Details Not Found", 404));
  }

  const txn = {
    id: payment.txnId,
    status: payment.resultInfo.resultStatus,
  };

  res.status(200).json({
    success: true,
    txn,
  });
});
