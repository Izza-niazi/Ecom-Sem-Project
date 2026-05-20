const PageView = require('../models/pageViewModel');
const UserActivity = require('../models/userActivityModel');
const Product = require('../models/productModel');
const Blog = require('../models/blogModel');
const PageSeo = require('../models/pageSeoModel');
const { STATIC_PAGES, getStaticPage, isExcludedFromSeo } = require('../constants/pageSeoRegistry');
const { scoreSeo, isWeakSeo } = require('./seoScore');

const DEFAULT_DAYS = 30;

function emptySeo() {
    return {
        pageTitle: '',
        metaDescription: '',
        keywords: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        robots: 'index, follow',
        canonicalPath: '',
    };
}

function docToSeo(doc) {
    if (!doc?.seo) return emptySeo();
    return { ...emptySeo(), ...(doc.seo.toObject?.() ?? doc.seo) };
}

/**
 * @param {string} pathname e.g. /product/abc
 */
function inferPageMeta(pathname) {
    const path = String(pathname || '/').split('?')[0] || '/';
    if (path === '/') {
        return { path: '/', pageType: 'home', entityKey: 'home' };
    }
    if (path === '/products') {
        return { path: '/products', pageType: 'listing', entityKey: 'products' };
    }
    if (path === '/blog') {
        return { path: '/blog', pageType: 'blog_list', entityKey: 'blog' };
    }
    const productMatch = path.match(/^\/product\/([^/]+)$/);
    if (productMatch) {
        return {
            path,
            pageType: 'product',
            entityId: productMatch[1],
            entityKey: productMatch[1],
        };
    }
    const blogMatch = path.match(/^\/blog\/([^/]+)$/);
    if (blogMatch) {
        return {
            path,
            pageType: 'blog',
            entityKey: blogMatch[1],
        };
    }
    if (isExcludedFromSeo(path)) {
        return { path, pageType: 'private', entityKey: path };
    }
    const staticPage = STATIC_PAGES.find((p) => p.path === path);
    if (staticPage) {
        return {
            path,
            pageType: 'static',
            entityKey: staticPage.key,
        };
    }
    return { path, pageType: 'other', entityKey: path };
}

function isAnalyticsRowExcluded(row) {
    if (!row?.path) return true;
    if (isExcludedFromSeo(row.path)) return true;
    if (row.pageType === 'private') return true;
    return false;
}

async function aggregatePageViews(since) {
    return PageView.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
            $group: {
                _id: {
                    path: '$path',
                    pageType: '$pageType',
                    entityId: '$entityId',
                    entityKey: '$entityKey',
                },
                views: { $sum: 1 },
                sessions: { $addToSet: '$sessionId' },
            },
        },
        {
            $project: {
                path: '$_id.path',
                pageType: '$_id.pageType',
                entityId: '$_id.entityId',
                entityKey: '$_id.entityKey',
                views: 1,
                uniqueSessions: {
                    $size: {
                        $filter: {
                            input: '$sessions',
                            as: 's',
                            cond: { $and: [{ $ne: ['$$s', null] }, { $ne: ['$$s', ''] }] },
                        },
                    },
                },
            },
        },
        { $sort: { views: -1 } },
        { $limit: 60 },
    ]);
}

async function aggregateProductActivityViews(since) {
    return UserActivity.aggregate([
        { $match: { action: 'view', createdAt: { $gte: since } } },
        {
            $group: {
                _id: '$product',
                views: { $sum: 1 },
            },
        },
        { $sort: { views: -1 } },
        { $limit: 40 },
    ]);
}

async function enrichPageRow(row) {
    const base = {
        path: row.path,
        pageType: row.pageType,
        views: row.views || 0,
        uniqueSessions: row.uniqueSessions || 0,
        entityId: row.entityId ? String(row.entityId) : null,
        entityKey: row.entityKey || null,
        label: row.path,
        seo: emptySeo(),
        seoScore: 0,
        weakSeo: true,
        pageKey: null,
        blogSlug: null,
        productId: null,
    };

    if (row.pageType === 'product' && row.entityId) {
        const product = await Product.findById(row.entityId).select('name seo category');
        if (product) {
            base.label = product.name;
            base.productId = String(product._id);
            base.seo = product.seo
                ? { ...emptySeo(), ...(product.seo.toObject?.() ?? product.seo) }
                : emptySeo();
            if (!base.seo.canonicalPath) {
                base.seo.canonicalPath = `/product/${product._id}`;
            }
        }
    } else if (row.pageType === 'blog' && row.entityKey) {
        const blog = await Blog.findOne({ slug: row.entityKey }).select('title slug seo');
        if (blog) {
            base.label = blog.title;
            base.blogSlug = blog.slug;
            base.seo = docToSeo(blog);
            if (!base.seo.canonicalPath) {
                base.seo.canonicalPath = `/blog/${blog.slug}`;
            }
        }
    } else if (row.pageType === 'blog_list') {
        base.label = 'Blog listing';
        base.pageKey = 'blog';
        const doc = await PageSeo.findOne({ pageKey: 'blog' });
        base.seo = docToSeo(doc);
    } else if (row.pageType === 'home') {
        base.label = 'Home';
        base.pageKey = 'home';
        const doc = await PageSeo.findOne({ pageKey: 'home' });
        base.seo = docToSeo(doc);
    } else if (row.pageType === 'listing' && row.path === '/products') {
        base.label = 'All products';
        base.pageKey = 'products';
        const doc = await PageSeo.findOne({ pageKey: 'products' });
        base.seo = docToSeo(doc);
    } else if (row.pageType === 'static' && row.entityKey) {
        const def = getStaticPage(row.entityKey);
        base.label = def?.label || row.entityKey;
        base.pageKey = row.entityKey;
        const doc = await PageSeo.findOne({ pageKey: row.entityKey });
        base.seo = docToSeo(doc);
    }

    base.seoScore = scoreSeo(base.seo);
    base.weakSeo = isWeakSeo(base.seo);
    return base;
}

/**
 * @param {number} [days]
 */
async function buildSeoAnalytics(days = DEFAULT_DAYS) {
    const periodDays = Math.min(90, Math.max(1, Number(days) || DEFAULT_DAYS));
    const since = new Date(Date.now() - periodDays * 86400000);

    const [pageViewRows, activityRows, totalPageViews, uniqueSessionsAgg] = await Promise.all([
        aggregatePageViews(since),
        aggregateProductActivityViews(since),
        PageView.countDocuments({ createdAt: { $gte: since } }),
        PageView.aggregate([
            { $match: { createdAt: { $gte: since }, sessionId: { $nin: [null, ''] } } },
            { $group: { _id: '$sessionId' } },
            { $count: 'count' },
        ]),
    ]);

    const merged = new Map();

    for (const row of pageViewRows) {
        if (isAnalyticsRowExcluded(row)) continue;
        const key = `${row.pageType}:${row.path}`;
        merged.set(key, { ...row });
    }

    for (const act of activityRows) {
        if (!act._id) continue;
        const path = `/product/${act._id}`;
        const key = `product:${path}`;
        const existing = merged.get(key);
        if (existing) {
            existing.views += act.views;
        } else {
            merged.set(key, {
                path,
                pageType: 'product',
                entityId: act._id,
                entityKey: String(act._id),
                views: act.views,
                uniqueSessions: 0,
            });
        }
    }

    const sorted = [...merged.values()]
        .filter((row) => !isAnalyticsRowExcluded(row))
        .sort((a, b) => (b.views || 0) - (a.views || 0));
    const enriched = await Promise.all(sorted.slice(0, 40).map(enrichPageRow));

    const opportunities = enriched
        .filter((p) => p.views >= 3 && p.weakSeo)
        .slice(0, 15);

    const productActivityViews = activityRows.reduce((s, r) => s + (r.views || 0), 0);

    return {
        periodDays,
        totals: {
            pageViews: totalPageViews,
            uniqueSessions: uniqueSessionsAgg[0]?.count || 0,
            productActivityViews,
        },
        topPages: enriched,
        opportunities,
    };
}

/**
 * Analytics snippet for a single page when generating SEO with AI.
 */
async function getAnalyticsHintForTarget({ pageKey, productId, blogId, days = 30 }) {
    const report = await buildSeoAnalytics(days);
    let row = null;

    if (productId) {
        row = report.topPages.find((p) => p.productId === String(productId));
    } else if (blogId) {
        const blog = await Blog.findById(blogId).select('slug');
        if (blog) {
            row = report.topPages.find((p) => p.blogSlug === blog.slug);
        }
    } else if (pageKey) {
        const def = getStaticPage(pageKey);
        row = report.topPages.find(
            (p) => p.pageKey === pageKey || p.path === def?.path
        );
    }

    if (!row || !row.views) {
        return 'Analytics (last 30 days): no significant traffic recorded yet for this URL.';
    }

    return `Analytics (last ${report.periodDays} days): ${row.views} page views, ~${row.uniqueSessions} sessions, current SEO score ${row.seoScore}/100${row.weakSeo ? ' (needs improvement)' : ''}.`;
}

function formatAnalyticsForAi(report) {
    const lines = [
        `Period: last ${report.periodDays} days`,
        `Total page views: ${report.totals.pageViews}`,
        `Unique sessions: ${report.totals.uniqueSessions}`,
        `Product detail views (activity log): ${report.totals.productActivityViews}`,
        '',
        'Top pages by traffic:',
    ];
    for (const p of report.topPages.slice(0, 12)) {
        lines.push(
            `- ${p.label} (${p.path}): ${p.views} views, SEO score ${p.seoScore}/100${p.weakSeo ? ' WEAK' : ''}`
        );
    }
    if (report.opportunities.length) {
        lines.push('', 'High-traffic pages with weak SEO (prioritize):');
        for (const o of report.opportunities.slice(0, 8)) {
            lines.push(`- ${o.label}: ${o.views} views, score ${o.seoScore}`);
        }
    }
    return lines.join('\n');
}

module.exports = {
    inferPageMeta,
    buildSeoAnalytics,
    getAnalyticsHintForTarget,
    formatAnalyticsForAi,
    DEFAULT_DAYS,
};
