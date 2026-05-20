const PageSeo = require('../models/pageSeoModel');
const Product = require('../models/productModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const { normalizeSeo } = require('../utils/normalizeSeo');
const { generateSeoFromContext } = require('../utils/seoAi');
const { getAnalyticsHintForTarget } = require('../utils/seoAnalyticsService');
const { STATIC_PAGES, getStaticPage } = require('../constants/pageSeoRegistry');
const { APP_NAME } = require('../constants/brand');

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
    if (!doc?.seo) {
        return emptySeo();
    }
    return { ...emptySeo(), ...doc.seo.toObject?.() ?? doc.seo };
}

async function buildProductContext(productId) {
    const product = await Product.findById(productId).select(
        'name description category brand price cuttedPrice stock highlights specifications'
    );
    if (!product) {
        throw new ErrorHandler('Product not found', 404);
    }
    const highlights = (product.highlights || []).slice(0, 8).join('; ');
    const specs = (product.specifications || [])
        .slice(0, 6)
        .map((s) => `${s.title}: ${s.description}`)
        .join('; ');
  const plainDesc = String(product.description || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 1200);

    return `Product detail page on ${APP_NAME}.
Product name: ${product.name}
Category: ${product.category}
Brand: ${product.brand?.name || 'N/A'}
Price PKR: ${product.price} (was ${product.cuttedPrice})
Stock: ${product.stock}
Description: ${plainDesc}
Highlights: ${highlights}
Specs: ${specs}
Canonical path should be: /product/${product._id}`;
}

/** GET /api/v1/seo/pages — public list of static page keys (no secrets) */
exports.listPublicPages = asyncErrorHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        pages: STATIC_PAGES.map(({ key, label, path }) => ({ key, label, path })),
    });
});

/** GET /api/v1/seo/page/:pageKey — public saved SEO for a static page */
exports.getPublicPageSeo = asyncErrorHandler(async (req, res) => {
    const pageKey = String(req.params.pageKey || '').trim();
    const def = getStaticPage(pageKey);
    if (!def) {
        return res.status(404).json({ success: false, message: 'Unknown page' });
    }
    const doc = await PageSeo.findOne({ pageKey });
    res.status(200).json({
        success: true,
        pageKey,
        path: def.path,
        seo: docToSeo(doc),
    });
});

/** GET /api/v1/admin/seo — registry + saved SEO for all static pages */
exports.getAdminSeoOverview = asyncErrorHandler(async (req, res) => {
    const saved = await PageSeo.find({ pageKey: { $in: STATIC_PAGES.map((p) => p.key) } });
    const byKey = Object.fromEntries(saved.map((d) => [d.pageKey, docToSeo(d)]));

    res.status(200).json({
        success: true,
        pages: STATIC_PAGES.map((p) => ({
            ...p,
            seo: byKey[p.key] || emptySeo(),
            hasSaved: Boolean(byKey[p.key]?.pageTitle || byKey[p.key]?.metaDescription),
        })),
    });
});

/** GET /api/v1/admin/seo/page/:pageKey */
exports.getAdminPageSeo = asyncErrorHandler(async (req, res) => {
    const pageKey = String(req.params.pageKey || '').trim();
    const def = getStaticPage(pageKey);
    if (!def) {
        throw new ErrorHandler('Unknown page', 400);
    }
    const doc = await PageSeo.findOne({ pageKey });
    res.status(200).json({
        success: true,
        page: def,
        seo: docToSeo(doc),
    });
});

/** GET /api/v1/admin/seo/product/:productId */
exports.getAdminProductSeo = asyncErrorHandler(async (req, res) => {
    const product = await Product.findById(req.params.productId).select('name seo category');
    if (!product) {
        throw new ErrorHandler('Product not found', 404);
    }
    const seo = product.seo
        ? { ...emptySeo(), ...(product.seo.toObject?.() ?? product.seo) }
        : emptySeo();
    res.status(200).json({
        success: true,
        product: {
            _id: product._id,
            name: product.name,
            category: product.category,
        },
        seo,
    });
});

/** PUT /api/v1/admin/seo/page/:pageKey */
exports.savePageSeo = asyncErrorHandler(async (req, res) => {
    const pageKey = String(req.params.pageKey || '').trim();
    const def = getStaticPage(pageKey);
    if (!def) {
        throw new ErrorHandler('Unknown page', 400);
    }
    const seo = normalizeSeo(req.body.seo ?? req.body);
    if (!seo) {
        throw new ErrorHandler('Invalid SEO payload', 400);
    }
    if (!seo.canonicalPath) {
        seo.canonicalPath = def.path;
    }
    const doc = await PageSeo.findOneAndUpdate(
        { pageKey },
        { pageKey, seo },
        { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({
        success: true,
        message: 'SEO saved',
        pageKey,
        seo: docToSeo(doc),
    });
});

/** PUT /api/v1/admin/seo/product/:productId */
exports.saveProductSeo = asyncErrorHandler(async (req, res) => {
    const seo = normalizeSeo(req.body.seo ?? req.body);
    if (!seo) {
        throw new ErrorHandler('Invalid SEO payload', 400);
    }
    if (!seo.canonicalPath) {
        seo.canonicalPath = `/product/${req.params.productId}`;
    }
    const product = await Product.findByIdAndUpdate(
        req.params.productId,
        { seo },
        { new: true, runValidators: true }
    ).select('name seo');
    if (!product) {
        throw new ErrorHandler('Product not found', 404);
    }
    res.status(200).json({
        success: true,
        message: 'Product SEO saved',
        productId: product._id,
        seo: { ...emptySeo(), ...(product.seo?.toObject?.() ?? product.seo) },
    });
});

/** POST /api/v1/admin/seo/generate — body: { pageKey } or { productId }, useAnalytics?: boolean */
exports.generateSeo = asyncErrorHandler(async (req, res) => {
    const { pageKey, productId, useAnalytics = true } = req.body;

    let context;
    if (productId) {
        context = await buildProductContext(productId);
    } else if (pageKey) {
        const def = getStaticPage(String(pageKey).trim());
        if (!def) {
            throw new ErrorHandler('Unknown page', 400);
        }
        const existing = await PageSeo.findOne({ pageKey: def.key });
        const current = docToSeo(existing);
        context = `${def.context}
URL path: ${def.path}
${current.pageTitle ? `Current title (may improve): ${current.pageTitle}` : ''}`;
    } else {
        throw new ErrorHandler('Provide pageKey or productId', 400);
    }

    if (!process.env.CEREBRAS_API_KEY && !process.env.GROQ_API_KEY) {
        throw new ErrorHandler(
            'Set CEREBRAS_API_KEY or GROQ_API_KEY in backend/.env to generate SEO',
            503
        );
    }

    try {
        let analyticsHint = '';
        if (useAnalytics) {
            analyticsHint = await getAnalyticsHintForTarget({
                pageKey: pageKey ? String(pageKey).trim() : null,
                productId: productId || null,
            });
        }
        const result = await generateSeoFromContext(context, analyticsHint);
        if (!result?.seo) {
            throw new ErrorHandler('AI could not produce valid SEO JSON', 502);
        }
        if (!result.seo.canonicalPath) {
            if (productId) {
                result.seo.canonicalPath = `/product/${productId}`;
            } else {
                const def = getStaticPage(String(pageKey).trim());
                result.seo.canonicalPath = def?.path || '/';
            }
        }
        res.status(200).json({
            success: true,
            source: result.source,
            seo: result.seo,
        });
    } catch (e) {
        if (e.statusCode) {
            throw e;
        }
        throw new ErrorHandler(e.message || 'SEO generation failed', 502);
    }
});
