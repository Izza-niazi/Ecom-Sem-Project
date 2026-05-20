/** Compute promo discount in PKR from applied coupon + cart subtotal. */
export function computeCouponDiscount(coupon, cartSubtotal) {
    if (!coupon || !cartSubtotal) return 0;
    const total = Number(cartSubtotal) || 0;
    if (coupon.discountAmount) {
        return Math.min(Number(coupon.discountAmount) || 0, total);
    }
    if (coupon.discountPercent) {
        return Math.min(Math.round((total * Number(coupon.discountPercent)) / 100), total);
    }
    if (coupon.discount) {
        return Math.min(Number(coupon.discount) || 0, total);
    }
    return 0;
}
