import { resolveProductImageUrl } from './mediaUrl';

export const EMPTY_SEO_FIELDS = {
    pageTitle: '',
    metaDescription: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    robots: 'index, follow',
    canonicalPath: '',
};

export function getSiteOrigin() {
    const env = process.env.REACT_APP_SITE_URL;
    if (env && typeof env === 'string') {
        return env.replace(/\/$/, '');
    }
    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin;
    }
    return '';
}

export function absoluteUrl(pathOrUrl) {
    if (pathOrUrl == null) return '';
    const p = String(pathOrUrl).trim();
    if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    const origin = getSiteOrigin();
    const path = p.startsWith('/') ? p : `/${p}`;
    if (!origin) return path;
    return `${origin}${path}`;
}

export function plainTextFromHtml(html) {
    if (html == null || typeof html !== 'string') return '';
    return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export function excerpt(text, maxLen) {
    if (!text) return '';
    const t = String(text).trim();
    if (t.length <= maxLen) return t;
    return `${t.slice(0, maxLen - 1).trim()}…`;
}

export function buildProductJsonLd(product, { description, canonical }) {
    const images = (product.images || [])
        .map((im) => absoluteUrl(resolveProductImageUrl(im.url)))
        .filter(Boolean);
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: description || product.name,
        image: images.length ? images : undefined,
        sku: String(product._id),
        offers: {
            '@type': 'Offer',
            url: canonical || undefined,
            priceCurrency: 'PKR',
            price: String(product.price),
            availability:
                product.stock > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
        },
    };
}
