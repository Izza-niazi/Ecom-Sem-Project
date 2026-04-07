/**
 * Rule-based natural language → structured product search (PK storefront: $ treated as Rs).
 */

const FILLER =
    /\b(show\s+me|find|search\s+for|i\s+want|i\s+need|looking\s+for|buy|get|give\s+me|something)\b/gi;

const CATEGORY_ALIASES = [
    { words: ['shoe', 'shoes', 'sneaker', 'sneakers', 'boot', 'boots', 'sandals'], category: 'Fashion' },
    { words: ['shirt', 'dress', 'jeans', 'jacket', 'clothing', 'apparel'], category: 'Fashion' },
    { words: ['laptop', 'laptops', 'notebook', 'macbook'], category: 'Laptops' },
    { words: ['phone', 'phones', 'mobile', 'mobiles', 'smartphone', 'iphone'], category: 'Mobiles' },
    { words: ['headphone', 'headphones', 'earbuds', 'earphone'], category: 'Electronics' },
    { words: ['tv', 'television', 'refrigerator', 'fridge', 'washing machine', 'microwave'], category: 'Appliances' },
    { words: ['table', 'chair', 'sofa', 'furniture', 'bed'], category: 'Home' },
];

function stripCommas(numStr) {
    return parseFloat(String(numStr).replace(/,/g, ''));
}

function parseMinRating(s) {
    let minRating = null;
    const starRe =
        /(?:at\s+least\s+)?(\d+(?:\.\d+)?)\s*(?:\+)?\s*stars?|rated\s+(?:above\s+)?(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*\+\s*stars?|minimum\s+(\d+(?:\.\d+)?)\s*stars?/gi;
    let m;
    const copy = s;
    while ((m = starRe.exec(copy)) !== null) {
        const n = parseFloat(m[1] || m[2] || m[3] || m[4]);
        if (!Number.isNaN(n) && n >= 0 && n <= 5) {
            minRating = n;
        }
    }
    return minRating;
}

/** "by Boat", "from Samsung", "brand Nike" */
function parseBrandHint(s) {
    const by = /\b(?:by|from|brand)\s+([a-z0-9][a-z0-9\s&.-]{1,40})/i.exec(s);
    if (by) {
        return by[1].trim().split(/\s+/).slice(0, 4).join(' ');
    }
    return '';
}

function parseNaturalLanguageSearch(raw) {
    let s = String(raw || '').trim();
    if (!s) {
        return {
            keyword: '',
            maxPrice: null,
            minPrice: null,
            category: '',
            minRating: null,
            brand: '',
        };
    }

    const minRating = parseMinRating(s);
    s = s.replace(
        /(?:at\s+least\s+)?\d+(?:\.\d+)?\s*(?:\+)?\s*stars?|rated\s+(?:above\s+)?\d+(?:\.\d+)?|\d+(?:\.\d+)?\s*\+\s*stars?|minimum\s+\d+(?:\.\d+)?\s*stars?/gi,
        ' '
    );

    const brand = parseBrandHint(s);
    s = s.replace(/\b(?:by|from|brand)\s+[a-z0-9][a-z0-9\s&.-]{1,40}/gi, ' ');

    let maxPrice = null;
    let minPrice = null;
    let category = '';

    const underRe =
        /(?:under|below|less\s+than|at\s+most|cheaper\s+than|upto|up\s+to)\s*(?:rs\.?|pkr|usd|\$)?\s*([\d,]+(?:\.\d+)?)/gi;
    let m;
    const underCopy = s;
    while ((m = underRe.exec(underCopy)) !== null) {
        const n = stripCommas(m[1]);
        if (!Number.isNaN(n)) {
            maxPrice = n;
        }
    }
    s = s.replace(underRe, ' ');

    const overRe =
        /(?:over|above|more\s+than|at\s+least)\s*(?:rs\.?|pkr|usd|\$)?\s*([\d,]+(?:\.\d+)?)/gi;
    while ((m = overRe.exec(s)) !== null) {
        const n = stripCommas(m[1]);
        if (!Number.isNaN(n)) {
            minPrice = n;
        }
    }
    s = s.replace(overRe, ' ');

    const forRe = /\b(?:for|@)\s*(?:rs\.?|pkr|usd|\$)?\s*([\d,]+(?:\.\d+)?)\b/gi;
    while ((m = forRe.exec(s)) !== null) {
        const n = stripCommas(m[1]);
        if (!Number.isNaN(n) && maxPrice === null) {
            maxPrice = n;
        }
    }
    s = s.replace(forRe, ' ');

    s = s.replace(FILLER, ' ').replace(/\s+/g, ' ').trim();

    const lower = s.toLowerCase();
    outer: for (const { words, category: cat } of CATEGORY_ALIASES) {
        for (const w of words) {
            const lw = w.toLowerCase();
            const hit = lw.includes(' ')
                ? lower.includes(lw)
                : new RegExp(`\\b${lw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(s);
            if (hit) {
                category = cat;
                s = s.replace(new RegExp(lw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), ' ');
                break outer;
            }
        }
    }

    s = s.replace(/\s+/g, ' ').trim();

    return {
        keyword: s,
        maxPrice,
        minPrice,
        category,
        minRating,
        brand,
    };
}

function normalizeSearch(obj) {
    const o = obj || {};
    return {
        keyword: String(o.keyword || '').trim(),
        category: String(o.category || '').trim(),
        brand: String(o.brand || '').trim(),
        minPrice: o.minPrice != null && Number.isFinite(Number(o.minPrice)) ? Number(o.minPrice) : null,
        maxPrice: o.maxPrice != null && Number.isFinite(Number(o.maxPrice)) ? Number(o.maxPrice) : null,
        minRating:
            o.minRating != null && Number.isFinite(Number(o.minRating))
                ? Math.min(5, Math.max(0, Number(o.minRating)))
                : null,
    };
}

function mergeSearch(ruleParsed, aiParsed) {
    const r = normalizeSearch(ruleParsed);
    const a = normalizeSearch(aiParsed);
    return {
        keyword: a.keyword || r.keyword,
        category: a.category || r.category,
        brand: a.brand || r.brand,
        minPrice: a.minPrice ?? r.minPrice,
        maxPrice: a.maxPrice ?? r.maxPrice,
        minRating: a.minRating ?? r.minRating,
    };
}

function buildFallbackReply(search) {
    const parts = [];
    if (search.keyword) parts.push(`“${search.keyword}”`);
    if (search.category) parts.push(`in ${search.category}`);
    if (search.brand) parts.push(`brand ${search.brand}`);
    if (search.maxPrice != null) parts.push(`under Rs ${Math.round(search.maxPrice)}`);
    if (search.minPrice != null) parts.push(`from Rs ${Math.round(search.minPrice)}`);
    if (search.minRating != null) parts.push(`${search.minRating}+ stars`);
    if (parts.length === 0) {
        return 'Tell me what you are looking for (product, price, category, or brand).';
    }
    return `Here is a search for ${parts.join(', ')}. Tap “View products” to see results.`;
}

module.exports = {
    parseNaturalLanguageSearch,
    normalizeSearch,
    mergeSearch,
    buildFallbackReply,
};
