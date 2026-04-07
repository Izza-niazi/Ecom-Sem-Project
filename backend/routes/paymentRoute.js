const express = require('express');
const {
    processPayment,
    paytmResponse,
    getPaymentStatus,
    sendStripeApiKey,
    listPaymentMethods,
} = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

router.route('/stripeapikey').get(isAuthenticatedUser, sendStripeApiKey);

router.route('/payment/methods').get(isAuthenticatedUser, listPaymentMethods);

router.route('/payment/process').post(isAuthenticatedUser, processPayment);

router.route('/callback').post(paytmResponse);

router.route('/payment/status/:id').get(isAuthenticatedUser, getPaymentStatus);

module.exports = router;
