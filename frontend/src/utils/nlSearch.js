/**
 * Rule-based natural language → structured search (PK storefront: treat $ as Rs amount).
 * Examples: "show me shoes under 5000", "laptops below Rs 80000", "phones over 10000"
 */

const FILLER =
    /\b(show\s+me|find|search\s+for|i\s+want|i\s+need|looking\s+for|buy|get|give\s+me|something)\b/gi;

/** Map common words to your catalog categories (extend as needed). */
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

export function parseNaturalLanguageSearch(raw) {
    let s = String(raw || '').trim();
    if (!s) {
        return { keyword: '', maxPrice: null, minPrice: null, category: '' };
    }

    let maxPrice = null;
    let minPrice = null;
    let category = '';

    // "under / below / less than / at most / max" + optional currency + number
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

    // "over / above / more than / at least" + number
    const overRe =
        /(?:over|above|more\s+than|at\s+least|starting\s+from)\s*(?:rs\.?|pkr|usd|\$)?\s*([\d,]+(?:\.\d+)?)/gi;
    while ((m = overRe.exec(s)) !== null) {
        const n = stripCommas(m[1]);
        if (!Number.isNaN(n)) {
            minPrice = n;
        }
    }
    s = s.replace(overRe, ' ');

    // trailing "for 50" / "at 5000"
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
    };
}

/** Build `/products[/keyword][?query]` for React Router. */
export function buildProductsSearchPath(parsed) {
    const { keyword, maxPrice, minPrice, category } = parsed;
    const q = new URLSearchParams();
    if (category) {
        q.set('category', category);
    }
    if (maxPrice != null && Number.isFinite(maxPrice)) {
        q.set('maxPrice', String(Math.round(maxPrice)));
    }
    if (minPrice != null && Number.isFinite(minPrice)) {
        q.set('minPrice', String(Math.round(minPrice)));
    }
    const qs = q.toString();
    const pathKeyword = keyword ? `/${encodeURIComponent(keyword)}` : '';
    return `/products${pathKeyword}${qs ? `?${qs}` : ''}`;
}
