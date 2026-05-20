const { APP_NAME } = require('./brand');

const FAQ = {
    shipping: {
        title: 'Shipping & delivery',
        reply: `**${APP_NAME} shipping**
• Standard delivery across Pakistan: **5–7 business days** after your order is confirmed.
• Delivery is **FREE** on all orders (shown at checkout).
• You'll get updates when your order moves to Shipped and Delivered (ask here: "Where is my order?" or check **My Orders**).
• We ship to the address you enter at checkout — please double-check city, province, and phone number.`,
    },
    returns: {
        title: 'Returns & refunds',
        reply: `**${APP_NAME} return policy**
• **7-day return window** for unused items in original packaging (electronics may require sealed box).
• Open **My Orders** → select the order → contact support with your reason.
• Refunds are processed to your **original payment method** within **5–10 business days** after we receive the return.
• Damaged or wrong items: report within **48 hours** of delivery with photos — we'll replace or refund.`,
    },
    payment: {
        title: 'Payment methods',
        reply: `**${APP_NAME} payments**
• We accept **cards via Stripe** (Visa, Mastercard, etc.) — secure checkout at **Pay PKR** step.
• **Test mode**: use card \`4242 4242 4242 4242\`, any future expiry, any CVC.
• Prices are in **PKR**. Product page discounts are applied automatically; promo codes can be applied in chat if available.
• We do **not** store full card numbers — Stripe handles payment details.`,
    },
};

function getFaqReply(topic) {
    const entry = FAQ[topic];
    if (!entry) return null;
    return entry.reply.replace(/\*\*/g, '');
}

module.exports = { FAQ, getFaqReply };
