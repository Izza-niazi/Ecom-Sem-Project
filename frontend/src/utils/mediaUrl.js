export function resolveProductImageUrl(url) {
    if (url == null || typeof url !== 'string') return '';
    const t = url.trim();
    if (!t) return '';
    if (/^https?:\/\//i.test(t)) return t;
    if (t.startsWith('//')) return `https:${t}`;
    return t;
}
