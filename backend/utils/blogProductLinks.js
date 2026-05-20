/**
 * Replace {{product:seedKey|Link text}} in blog HTML with /product/:id links.
 * @param {string} html
 * @param {Record<string, string>} linkMap seedKey -> /product/id path
 */
function applyProductLinks(html, linkMap) {
    if (!html || !linkMap || typeof linkMap !== 'object') {
        return html || '';
    }
    return String(html).replace(
        /\{\{product:([^}|]+)(?:\|([^}]*))?\}\}/g,
        (_, key, label) => {
            const k = String(key).trim();
            const href = linkMap[k];
            if (!href) {
                return label ? String(label).trim() : k;
            }
            const text = (label && String(label).trim()) || k;
            return `<a href="${href}">${text}</a>`;
        }
    );
}

/**
 * @param {import('mongoose').Document[]} products - must have seedKey and _id
 * @returns {Record<string, string>}
 */
function buildProductLinkMap(products) {
    const map = {};
    for (const p of products) {
        const key = p.seedKey || (p.toObject && p.toObject().seedKey);
        if (key && p._id) {
            map[key] = `/product/${p._id}`;
        }
    }
    return map;
}

module.exports = { applyProductLinks, buildProductLinkMap };
