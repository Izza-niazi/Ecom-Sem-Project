export const getDiscount = (price, cuttedPrice) => {
    return (((cuttedPrice - price) / cuttedPrice) * 100).toFixed();
}

export const getDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(new Date().getDate() + 7)
    return deliveryDate.toUTCString().substring(0, 11);
}

export const formatDate = (dt) => {
    return new Date(dt).toUTCString().substring(0,16);
}

/** Deterministic slices from DB products so each home row can show a different set without dummy data. */
export const sliceProductsForHome = (products, sectionIndex, count = 12) => {
    if (!products?.length) return [];
    const sorted = [...products].sort((a, b) => String(a._id).localeCompare(String(b._id)));
    const n = sorted.length;
    const start = n <= 1 ? 0 : (sectionIndex * 5) % n;
    const out = [];
    const seen = new Set();
    let i = 0;
    while (out.length < Math.min(count, n) && seen.size < n) {
        const p = sorted[(start + i) % n];
        i += 1;
        const id = String(p._id);
        if (!seen.has(id)) {
            seen.add(id);
            out.push(p);
        }
    }
    return out;
};

/** Best-rated products first (tie-break: more reviews, then stable id). */
export const topRatedProductsForHome = (products, count = 12) => {
    if (!products?.length) return [];
    return [...products]
        .sort((a, b) => {
            const ra = Number(a.ratings) || 0;
            const rb = Number(b.ratings) || 0;
            if (rb !== ra) return rb - ra;
            const na = Number(a.numOfReviews) || 0;
            const nb = Number(b.numOfReviews) || 0;
            if (nb !== na) return nb - na;
            return String(a._id).localeCompare(String(b._id));
        })
        .slice(0, Math.min(count, products.length));
};