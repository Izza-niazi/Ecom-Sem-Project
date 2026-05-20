/** Promo codes — used by chat + checkout when no DB coupons exist. */
const COUPONS = [
    {
        code: 'WELCOME500',
        description: 'Rs 500 off orders over Rs 5,000',
        discountAmount: 500,
        minOrder: 5000,
        active: true,
    },
    {
        code: 'SAVE10',
        description: '10% off orders over Rs 10,000',
        discountPercent: 10,
        minOrder: 10000,
        active: true,
    },
];

function listActiveCoupons() {
    return COUPONS.filter((c) => c.active).map((c) => ({
        code: c.code,
        description: c.description,
    }));
}

/**
 * @param {string} code
 * @param {number} cartTotal PKR
 * @returns {{ valid: boolean, message: string, discount: number, coupon?: object }}
 */
function validateCoupon(code, cartTotal) {
    const normalized = String(code || '')
        .trim()
        .toUpperCase();
    if (!normalized) {
        return { valid: false, message: 'Enter a coupon code.', discount: 0 };
    }

    const coupon = COUPONS.find((c) => c.code === normalized && c.active);
    if (!coupon) {
        return {
            valid: false,
            message: `Coupon "${normalized}" is not valid.`,
            discount: 0,
        };
    }

    const total = Number(cartTotal) || 0;
    if (coupon.minOrder && total < coupon.minOrder) {
        return {
            valid: false,
            message: `${coupon.code} needs a cart total of at least Rs ${coupon.minOrder.toLocaleString('en-PK')}. Yours is Rs ${total.toLocaleString('en-PK')}.`,
            discount: 0,
        };
    }

    let discount = 0;
    if (coupon.discountAmount) {
        discount = coupon.discountAmount;
    } else if (coupon.discountPercent) {
        discount = Math.round((total * coupon.discountPercent) / 100);
    }

    discount = Math.min(discount, total);

    return {
        valid: true,
        message: `${coupon.code} applied: ${coupon.description} (−Rs ${discount.toLocaleString('en-PK')}).`,
        discount,
        coupon: {
            code: coupon.code,
            description: coupon.description,
            discountAmount: coupon.discountAmount || 0,
            discountPercent: coupon.discountPercent || 0,
        },
    };
}

module.exports = { COUPONS, listActiveCoupons, validateCoupon };
