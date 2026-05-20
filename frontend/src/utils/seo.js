import { resolveProductImageUrl } from './mediaUrl';

export const EMPTY_SEO_FIELDS = {
    pageTitle: '',
    metaDescription: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    robots: 'index, follow',
    canonicalPath: '',
};

/** Pick first non-empty string from candidates. */
export function coalesce(...values) {
    for (const v of values) {
        const s = v == null ? '' : String(v).trim();
        if (s) return s;
    }
    return '';
}

/**
 * Merge DB page SEO with route-specific fallbacks for MetaData.
 * @param {object|null|undefined} saved - from API
 * @param {object} defaults - { title, description, keywords, canonical, ogTitle, ogDescription, ogImage, robots }
 */
export function mergePageMeta(saved, defaults) {
    const s = saved || {};
    return {
        title: coalesce(s.pageTitle, defaults.title),
        description: coalesce(s.metaDescription, defaults.description),
        keywords: coalesce(s.keywords, defaults.keywords),
        canonical: absoluteUrl(coalesce(s.canonicalPath, defaults.canonicalPath)),
        ogTitle: coalesce(s.ogTitle, s.pageTitle, defaults.ogTitle, defaults.title),
        ogDescription: coalesce(s.ogDescription, s.metaDescription, defaults.ogDescription, defaults.description),
        ogImage: coalesce(s.ogImage, defaults.ogImage),
        robots: coalesce(s.robots, defaults.robots) || 'index, follow',
    };
}

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

export function buildBlogJsonLd(blog, { description, canonical }) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog.title,
        description: description || blog.excerpt || blog.title,
        image: blog.coverImage || undefined,
        datePublished: blog.publishedAt || blog.createdAt,
        dateModified: blog.updatedAt || blog.publishedAt,
        author: {
            '@type': 'Organization',
            name: blog.author || 'izzmarket',
        },
        mainEntityOfPage: canonical || undefined,
    };
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
