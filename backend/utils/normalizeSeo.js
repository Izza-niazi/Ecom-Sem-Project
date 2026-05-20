/**
 * Normalize SEO fields from API body or AI JSON.
 * @param {object|string|null} raw
 * @returns {object|null}
 */
function normalizeSeo(raw) {
    if (raw == null || raw === '') {
        return null;
    }
    let data = raw;
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch {
            return null;
        }
    }
    if (!data || typeof data !== 'object') {
        return null;
    }
    const robots =
        String(data.robots || 'index, follow')
            .trim()
            .slice(0, 80) || 'index, follow';
    return {
        pageTitle: String(data.pageTitle || '')
            .trim()
            .slice(0, 70),
        metaDescription: String(data.metaDescription || '')
            .trim()
            .slice(0, 320),
        keywords: String(data.keywords || '')
            .trim()
            .slice(0, 500),
        ogTitle: String(data.ogTitle || '')
            .trim()
            .slice(0, 95),
        ogDescription: String(data.ogDescription || '')
            .trim()
            .slice(0, 200),
        ogImage: String(data.ogImage || '')
            .trim()
            .slice(0, 500),
        robots,
        canonicalPath: String(data.canonicalPath || '')
            .trim()
            .slice(0, 500),
    };
}

module.exports = { normalizeSeo };
