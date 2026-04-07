const Product = require('../models/productModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const SearchFeatures = require('../utils/searchFeatures');
const ErrorHandler = require('../utils/errorHandler');
const { uploadImage, destroyImage } = require("../utils/localImageUpload");

function normalizeSeoBody(body) {
    if (body.seo == null || body.seo === '') {
        delete body.seo;
        return;
    }
    let raw = body.seo;
    if (typeof raw === 'string') {
        try {
            raw = JSON.parse(raw);
        } catch {
            delete body.seo;
            return;
        }
    }
    if (!raw || typeof raw !== 'object') {
        delete body.seo;
        return;
    }
    const robots = String(raw.robots || 'index, follow').trim().slice(0, 80) || 'index, follow';
    body.seo = {
        pageTitle: String(raw.pageTitle || '').trim().slice(0, 70),
        metaDescription: String(raw.metaDescription || '').trim().slice(0, 320),
        keywords: String(raw.keywords || '').trim().slice(0, 500),
        ogTitle: String(raw.ogTitle || '').trim().slice(0, 95),
        ogDescription: String(raw.ogDescription || '').trim().slice(0, 200),
        robots,
        canonicalPath: String(raw.canonicalPath || '').trim().slice(0, 500),
    };
}

// Get All Products
exports.getAllProducts = asyncErrorHandler(async (req, res, next) => {

    const resultPerPage = 12;
    const productsCount = await Product.countDocuments();

    const searchFeature = new SearchFeatures(Product.find(), req.query)
        .search()
        .filter();

    let products = await searchFeature.query;
    let filteredProductsCount = products.length;

    searchFeature.pagination(resultPerPage);

    products = await searchFeature.query.clone();

    res.status(200).json({
        success: true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });
});

// Get All Products ---Product Sliders
exports.getProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,
    });
});

// Autocomplete: product names + category names matching q (min 2 chars)
exports.searchSuggestions = asyncErrorHandler(async (req, res, next) => {
    const q = (req.query.q || '').trim();
    if (q.length < 2) {
        return res.status(200).json({ success: true, products: [], categories: [] });
    }
    const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(esc, 'i');

    const [products, categoryMatches] = await Promise.all([
        Product.find({ name: { $regex: regex } })
            .select('name category _id')
            .limit(8)
            .lean(),
        Product.distinct('category', {
            category: { $regex: regex, $nin: [null, ''] },
        }),
    ]);

    res.status(200).json({
        success: true,
        products: products.map((p) => ({
            _id: p._id,
            name: p.name,
            category: p.category,
        })),
        categories: (categoryMatches || []).slice(0, 6),
    });
});

// Distinct categories that have at least one product (for nav / home strip)
exports.getProductCategories = asyncErrorHandler(async (req, res, next) => {
    const raw = await Product.distinct('category', {
        category: { $nin: [null, ''] },
    });
    const categories = [...new Set(raw.map((c) => String(c).trim()).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
    );
    res.status(200).json({ success: true, categories });
});

// Get Product Details
exports.getProductDetails = asyncErrorHandler(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        product,
    });
});

// Get All Products ---ADMIN
exports.getAdminProducts = asyncErrorHandler(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,
    });
});

// Create Product ---ADMIN
exports.createProduct = asyncErrorHandler(async (req, res, next) => {

    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imagesLink = [];

    for (let i = 0; i < images.length; i++) {
        const result = await uploadImage(images[i], {
            folder: "products",
        });

        imagesLink.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }

    const result = await uploadImage(req.body.logo, {
        folder: "brands",
    });
    const brandLogo = {
        public_id: result.public_id,
        url: result.secure_url,
    };

    req.body.brand = {
        name: req.body.brandname,
        logo: brandLogo
    }
    req.body.images = imagesLink;
    req.body.user = req.user.id;

    let specs = [];
    req.body.specifications.forEach((s) => {
        specs.push(JSON.parse(s))
    });
    req.body.specifications = specs;
    normalizeSeoBody(req.body);

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product
    });
});

// Update Product ---ADMIN
exports.updateProduct = asyncErrorHandler(async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    if (req.body.images !== undefined) {
        let images = [];
        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images;
        }
        for (let i = 0; i < product.images.length; i++) {
            await destroyImage(product.images[i].public_id);
        }

        const imagesLink = [];

        for (let i = 0; i < images.length; i++) {
            const result = await uploadImage(images[i], {
                folder: "products",
            });

            imagesLink.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        req.body.images = imagesLink;
    }

    if (req.body.logo && req.body.logo.length > 0) {
        await destroyImage(product.brand.logo.public_id);
        const result = await uploadImage(req.body.logo, {
            folder: "brands",
        });
        const brandLogo = {
            public_id: result.public_id,
            url: result.secure_url,
        };

        req.body.brand = {
            name: req.body.brandname,
            logo: brandLogo
        }
    }

    let specs = [];
    req.body.specifications.forEach((s) => {
        specs.push(JSON.parse(s))
    });
    req.body.specifications = specs;
    req.body.user = req.user.id;
    normalizeSeoBody(req.body);

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(201).json({
        success: true,
        product
    });
});

// Delete Product ---ADMIN
exports.deleteProduct = asyncErrorHandler(async (req, res, next) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    for (let i = 0; i < product.images.length; i++) {
        await destroyImage(product.images[i].public_id);
    }

    await product.remove();

    res.status(201).json({
        success: true
    });
});

// Create OR Update Reviews
exports.createProductReview = asyncErrorHandler(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    const isReviewed = product.reviews.find(review => review.user.toString() === req.user._id.toString());

    if (isReviewed) {

        product.reviews.forEach((rev) => { 
            if (rev.user.toString() === req.user._id.toString())
                (rev.rating = rating, rev.comment = comment);
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    });
});

// Get reviews for one product (?id=) or all reviews across the catalog (no id) — admin
exports.getProductReviews = asyncErrorHandler(async (req, res, next) => {
    const mapReview = (r, productDoc) => {
        const base = typeof r.toObject === 'function' ? r.toObject() : { ...r };
        return {
            ...base,
            productId: productDoc._id,
            productName: productDoc.name,
        };
    };

    if (req.query.id) {
        const product = await Product.findById(req.query.id);

        if (!product) {
            return next(new ErrorHandler("Product Not Found", 404));
        }

        return res.status(200).json({
            success: true,
            reviews: product.reviews.map((r) => mapReview(r, product)),
        });
    }

    const products = await Product.find({ 'reviews.0': { $exists: true } }).select('name reviews');
    const flat = [];
    for (const p of products) {
        for (const r of p.reviews) {
            flat.push(mapReview(r, p));
        }
    }
    flat.sort((a, b) => String(b._id).localeCompare(String(a._id)));

    res.status(200).json({
        success: true,
        reviews: flat,
    });
});

// Delete Reveiws
exports.deleteReview = asyncErrorHandler(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new ErrorHandler("Product Not Found", 404));
    }

    const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString());

    let avg = 0;

    reviews.forEach((rev) => {
        avg += rev.rating;
    });

    let ratings = 0;

    if (reviews.length === 0) {
        ratings = 0;
    } else {
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings: Number(ratings),
        numOfReviews,
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    res.status(200).json({
        success: true,
    });
});