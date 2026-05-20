/**
 * Score saved SEO fields 0–100 for analytics prioritization.
 * @param {object|null|undefined} seo
 */
function scoreSeo(seo) {
    const s = seo || {};
    let score = 0;
    const title = String(s.pageTitle || '').trim();
    const desc = String(s.metaDescription || '').trim();
    const keywords = String(s.keywords || '').trim();
    const canonical = String(s.canonicalPath || '').trim();
    const ogTitle = String(s.ogTitle || '').trim();
    const ogDesc = String(s.ogDescription || '').trim();

    if (title.length >= 20 && title.length <= 70) score += 25;
    else if (title.length > 0) score += 12;

    if (desc.length >= 80 && desc.length <= 160) score += 30;
    else if (desc.length >= 40) score += 18;
    else if (desc.length > 0) score += 8;

    if (keywords.length > 10) score += 15;
    if (canonical.startsWith('/')) score += 10;
    if (ogTitle.length > 0) score += 10;
    if (ogDesc.length > 0) score += 10;

    return Math.min(100, score);
}

function isWeakSeo(seo, threshold = 45) {
    return scoreSeo(seo) < threshold;
}

module.exports = { scoreSeo, isWeakSeo };
