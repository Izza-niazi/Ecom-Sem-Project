function parseCartAssist(text) {
    const q = String(text || '').trim();
    if (!q) return null;

    // apply WELCOME500 / use SAVE10 (code without the word "coupon")
    let m = q.match(/\b(?:apply|use)\s+([A-Za-z0-9_-]{3,24})\b/i);
    if (m && !/^(?:coupon|promo|discount|code|a)$/i.test(m[1])) {
        return { type: 'apply_coupon', code: m[1].toUpperCase() };
    }

    m = q.match(
        /\b(?:apply|use)\s+(?:the\s+)?(?:coupon|code|promo)\s+([A-Za-z0-9_-]{3,24})\b/i
    );
    if (m) {
        return { type: 'apply_coupon', code: m[1].toUpperCase() };
    }

    m = q.match(/\b(?:coupon|promo)\s+code\s+([A-Za-z0-9_-]{3,24})\b/i);
    if (m) {
        return { type: 'apply_coupon', code: m[1].toUpperCase() };
    }

    // apply coupon / apply discount (no code) → list available codes
    if (
        /^\s*(?:apply|use)\s+(?:a\s+)?(?:coupon|promo|discount)\s*$/i.test(q) ||
        /^\s*(?:apply|use)\s+(?:my\s+)?discount\s*$/i.test(q)
    ) {
        return { type: 'list_coupons' };
    }

    if (
        /\b(?:what|any|available)\s+coupons?\b/i.test(q) ||
        /\b(?:list|show)\s+(?:available\s+)?coupons?\b/i.test(q) ||
        /\bdiscount\s+codes?\b/i.test(q)
    ) {
        return { type: 'list_coupons' };
    }

    m =
        q.match(/\b(?:add|put)\s+(.+?)\s+(?:to\s+)?(?:my\s+)?cart\b/i) ||
        q.match(/\badd\s+(.+?)\s+to\s+(?:my\s+)?(?:shopping\s+)?cart\b/i);
    if (m) {
        return { type: 'add', query: m[1].trim() };
    }

    m =
        q.match(/\bremove\s+(.+?)\s+from\s+(?:my\s+)?cart\b/i) ||
        q.match(/\bdelete\s+(.+?)\s+from\s+(?:my\s+)?cart\b/i);
    if (m) {
        return { type: 'remove', query: m[1].trim() };
    }

    if (
        /\b(?:what'?s in|show|view|see|check)\s+(?:my\s+)?cart\b/i.test(q) ||
        /^(?:my\s+)?cart\s*$/i.test(q) ||
        /\bcart summary\b/i.test(q)
    ) {
        return { type: 'summary' };
    }

    if (/\b(?:go to|open)\s+(?:my\s+)?cart\b/i.test(q)) {
        return { type: 'go_cart' };
    }

    return null;
}

/** Broad cart/coupon intent (even when parseCartAssist needs a follow-up). */
function isCartAssistQuery(text) {
    const q = String(text || '').trim();
    if (!q) return false;
    if (parseCartAssist(q)) return true;

    return (
        /\b(?:apply|use)\s+(?:coupon|promo|discount|[A-Za-z0-9_-]{3,})\b/i.test(q) ||
        /\b(?:add|remove|delete)\b.*\bcart\b/i.test(q) ||
        /\bcart\b.*\b(?:add|remove|summary|checkout)\b/i.test(q) ||
        /\b(?:coupon|promo code|discount code)\b/i.test(q)
    );
}

module.exports = { parseCartAssist, isCartAssistQuery };
