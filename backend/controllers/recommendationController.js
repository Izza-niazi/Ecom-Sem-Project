const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const UserActivity = require('../models/userActivityModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');

const TRENDING_DAYS = 30;
const ACTIVITY_DAYS = 90;
const LIMIT = 12;

async function trendingProductIds(limit = 24) {
    const since = new Date(Date.now() - TRENDING_DAYS * 86400000);
    const orders = await Order.find({
        paidAt: { $gte: since },
    }).select('orderItems.product orderItems.quantity');

    const counts = new Map();
    for (const order of orders) {
        for (const item of order.orderItems) {
            const id = item.product.toString();
            counts.set(id, (counts.get(id) || 0) + (item.quantity || 1));
        }
    }
    return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id)
        .slice(0, limit);
}

async function hydrateProducts(ids) {
    if (!ids.length) {
        return [];
    }
    const products = await Product.find({ _id: { $in: ids } });
    const byId = new Map(products.map((p) => [p._id.toString(), p]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
}

/** Rule-based: products bought in the same orders as :productId */
exports.getAlsoBought = asyncErrorHandler(async (req, res, next) => {
    const { productId } = req.params;
    const orders = await Order.find({
        'orderItems.product': productId,
    }).select('orderItems.product');

    const counts = new Map();
    for (const order of orders) {
        for (const item of order.orderItems) {
            const id = item.product.toString();
            if (id === productId) {
                continue;
            }
            counts.set(id, (counts.get(id) || 0) + 1);
        }
    }
    const sortedIds = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id)
        .slice(0, LIMIT);

    const products = await hydrateProducts(sortedIds);
    res.status(200).json({ success: true, products });
});

/**
 * Home rows:
 * - youMayAlsoLike: trending (purchase volume)
 * - suggestedForYou: categories inferred from recent views (logged-in), else next trending slice
 */
exports.getHomeRecommendations = asyncErrorHandler(async (req, res, next) => {
    const trendingIds = await trendingProductIds(36);
    let youMayAlsoLike = await hydrateProducts(trendingIds.slice(0, LIMIT));

    let suggestedForYou = [];
    if (req.user) {
        const since = new Date(Date.now() - ACTIVITY_DAYS * 86400000);
        const activities = await UserActivity.find({
            user: req.user._id,
            action: 'view',
            createdAt: { $gte: since },
        })
            .sort({ createdAt: -1 })
            .limit(80)
            .populate('product', 'category _id');

        const categoryWeight = new Map();
        const seenProductIds = new Set();
        for (const row of activities) {
            if (row.product?._id) {
                seenProductIds.add(row.product._id.toString());
            }
            const cat = row.product?.category;
            if (cat) {
                categoryWeight.set(cat, (categoryWeight.get(cat) || 0) + 1);
            }
        }

        const topCats = [...categoryWeight.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([c]) => c)
            .slice(0, 4);

        if (topCats.length) {
            const candidates = await Product.find({
                category: { $in: topCats },
                _id: { $nin: [...seenProductIds] },
            })
                .sort({ ratings: -1, numOfReviews: -1 })
                .limit(LIMIT * 2);

            suggestedForYou = candidates.slice(0, LIMIT);
        }
    }

    if (!suggestedForYou.length) {
        suggestedForYou = await hydrateProducts(trendingIds.slice(LIMIT, LIMIT * 2));
    }

    if (!youMayAlsoLike.length) {
        const fallback = await Product.find().sort({ ratings: -1 }).limit(LIMIT);
        youMayAlsoLike = fallback;
    }
    if (!suggestedForYou.length) {
        const fallback = await Product.find().sort({ numOfReviews: -1 }).skip(LIMIT).limit(LIMIT);
        suggestedForYou = fallback;
    }

    res.status(200).json({
        success: true,
        youMayAlsoLike,
        suggestedForYou,
    });
});

/** Paginated list for admin — product views/clicks (logged-in and guest). */
exports.getAdminActivities = asyncErrorHandler(async (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(10, parseInt(req.query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.action === 'view' || req.query.action === 'click') {
        filter.action = req.query.action;
    }

    const [activities, total] = await Promise.all([
        UserActivity.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'name email')
            .populate('product', 'name category'),
        UserActivity.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        activities,
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    });
});

exports.trackActivity = asyncErrorHandler(async (req, res, next) => {
    const { productId, action = 'view', source = '' } = req.body;
    if (!productId) {
        return next(new ErrorHandler('productId is required', 400));
    }
    if (!['view', 'click'].includes(action)) {
        return next(new ErrorHandler('Invalid action', 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorHandler('Product Not Found', 404));
    }

    await UserActivity.create({
        user: req.user ? req.user._id : null,
        product: productId,
        action,
        source: String(source).slice(0, 200),
    });

    res.status(201).json({ success: true });
});
