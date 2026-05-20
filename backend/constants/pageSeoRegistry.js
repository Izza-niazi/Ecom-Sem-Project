const { APP_NAME, APP_TAGLINE } = require('./brand');

/**
 * Storefront pages worth managing in SEO Manager (public / discovery).
 * Cart, wishlist, account, login, checkout, etc. are excluded — use noindex defaults in components.
 */
const STATIC_PAGES = [
    {
        key: 'home',
        label: 'Home',
        path: '/',
        context: `Homepage of ${APP_NAME}, an online marketplace. ${APP_TAGLINE}. Features categories, deals, and product sliders.`,
    },
    {
        key: 'products',
        label: 'All products / catalog',
        path: '/products',
        context: `Main product listing on ${APP_NAME}. Users filter by category, price (PKR), brand, and ratings.`,
    },
    {
        key: 'blog',
        label: 'Blog / articles',
        path: '/blog',
        context: `Editorial blog and shopping guides on ${APP_NAME} — tips, trends, and SEO articles for customers in Pakistan.`,
    },
    {
        key: 'not-found',
        label: '404 Not found',
        path: '/404',
        context: `Page shown when a URL does not exist on ${APP_NAME}. Should use noindex.`,
    },
];

/** Exact paths or prefixes that must not appear in SEO Manager or SEO analytics. */
const SEO_EXCLUDED_PATHS = [
    '/cart',
    '/wishlist',
    '/login',
    '/register',
    '/shipping',
    '/account',
    '/admin',
    '/order',
    '/orders',
    '/process',
];

function getStaticPage(key) {
    return STATIC_PAGES.find((p) => p.key === key) || null;
}

/**
 * @param {string} pathname
 * @returns {boolean}
 */
function isExcludedFromSeo(pathname) {
    const path = String(pathname || '/').split('?')[0] || '/';
    return SEO_EXCLUDED_PATHS.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`)
    );
}

module.exports = {
    STATIC_PAGES,
    SEO_EXCLUDED_PATHS,
    getStaticPage,
    isExcludedFromSeo,
};
