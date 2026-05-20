const Blog = require('../models/blogModel');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');
const ErrorHandler = require('../utils/errorHandler');
const { normalizeSeo } = require('../utils/normalizeSeo');
const { slugify } = require('../utils/slugify');
const { generateSeoFromContext } = require('../utils/seoAi');
const { getAnalyticsHintForTarget } = require('../utils/seoAnalyticsService');
const { APP_NAME } = require('../constants/brand');

function normalizeBlogBody(body) {
    if (body.seo != null) {
        const seo = normalizeSeo(body.seo);
        body.seo = seo || undefined;
    }
    if (body.tags && typeof body.tags === 'string') {
        body.tags = body.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
    }
    if (body.published === true || body.published === 'true') {
        body.published = true;
        if (!body.publishedAt) {
            body.publishedAt = new Date();
        }
    } else if (body.published === false || body.published === 'false') {
        body.published = false;
    }
}

async function uniqueSlug(base, excludeId) {
    let slug = slugify(base) || 'post';
    let candidate = slug;
    let n = 0;
    while (true) {
        const q = { slug: candidate };
        if (excludeId) q._id = { $ne: excludeId };
        const exists = await Blog.findOne(q).select('_id');
        if (!exists) return candidate;
        n += 1;
        candidate = `${slug}-${n}`;
    }
}

function applyDefaultSeo(blog) {
    const path = `/blog/${blog.slug}`;
    const seo = blog.seo || {};
    const plain = String(blog.content || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const desc =
        (seo.metaDescription && seo.metaDescription.trim()) ||
        (blog.excerpt && blog.excerpt.trim()) ||
        plain.slice(0, 155);
    return {
        pageTitle: (seo.pageTitle && seo.pageTitle.trim()) || blog.title,
        metaDescription: desc,
        keywords:
            (seo.keywords && seo.keywords.trim()) ||
            (blog.tags || []).join(', '),
        ogTitle: (seo.ogTitle && seo.ogTitle.trim()) || blog.title,
        ogDescription: (seo.ogDescription && seo.ogDescription.trim()) || desc,
        ogImage: (seo.ogImage && seo.ogImage.trim()) || blog.coverImage || '',
        robots: (seo.robots && seo.robots.trim()) || 'index, follow',
        canonicalPath: (seo.canonicalPath && seo.canonicalPath.trim()) || path,
    };
}

function serializeBlog(doc, { includeContent = false } = {}) {
    const b = doc.toObject ? doc.toObject() : doc;
    const seo = applyDefaultSeo(b);
    const out = {
        _id: b._id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        coverImage: b.coverImage,
        tags: b.tags || [],
        author: b.author,
        published: b.published,
        publishedAt: b.publishedAt,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        seo,
    };
    if (includeContent) {
        out.content = b.content;
    }
    return out;
}

/** GET /api/v1/blogs — public published list */
exports.getPublishedBlogs = asyncErrorHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const filter = { published: true };
    const [blogs, total] = await Promise.all([
        Blog.find(filter)
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-content'),
        Blog.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        blogs: blogs.map((b) => serializeBlog(b)),
        page,
        pages: Math.ceil(total / limit) || 1,
        total,
    });
});

/** GET /api/v1/blog/:slug — public single post */
exports.getBlogBySlug = asyncErrorHandler(async (req, res) => {
    const blog = await Blog.findOne({
        slug: String(req.params.slug || '').toLowerCase(),
        published: true,
    });
    if (!blog) {
        throw new ErrorHandler('Blog post not found', 404);
    }
    res.status(200).json({
        success: true,
        blog: serializeBlog(blog, { includeContent: true }),
    });
});

/** GET /api/v1/admin/blogs */
exports.getAdminBlogs = asyncErrorHandler(async (req, res) => {
    const blogs = await Blog.find().sort({ updatedAt: -1 });
    res.status(200).json({
        success: true,
        blogs,
    });
});

/** GET /api/v1/admin/blog/:id */
exports.getAdminBlog = asyncErrorHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        throw new ErrorHandler('Blog not found', 404);
    }
    res.status(200).json({ success: true, blog });
});

/** POST /api/v1/admin/blog/new */
exports.createBlog = asyncErrorHandler(async (req, res) => {
    normalizeBlogBody(req.body);
    const title = String(req.body.title || '').trim();
    if (!title) {
        return next(new ErrorHandler('Title is required', 400));
    }
    const slug = req.body.slug
        ? slugify(req.body.slug)
        : await uniqueSlug(title);
    req.body.slug = slug;
    req.body.createdBy = req.user._id;
    if (!req.body.seo?.canonicalPath) {
        req.body.seo = { ...(req.body.seo || {}), canonicalPath: `/blog/${slug}` };
    }

    const blog = await Blog.create(req.body);
    res.status(201).json({ success: true, blog });
});

/** PUT /api/v1/admin/blog/:id */
exports.updateBlog = asyncErrorHandler(async (req, res) => {
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
        return next(new ErrorHandler('Blog not found', 404));
    }
    normalizeBlogBody(req.body);
    if (req.body.title && !req.body.slug) {
        req.body.slug = await uniqueSlug(req.body.title, blog._id);
    } else if (req.body.slug) {
        req.body.slug = await uniqueSlug(req.body.slug, blog._id);
    }
    if (req.body.published && !blog.publishedAt) {
        req.body.publishedAt = new Date();
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({ success: true, blog });
});

/** POST /api/v1/admin/blog/:id/seo/generate */
exports.generateBlogSeo = asyncErrorHandler(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        return next(new ErrorHandler('Blog not found', 404));
    }
    if (!process.env.CEREBRAS_API_KEY && !process.env.GROQ_API_KEY) {
        throw new ErrorHandler(
            'Set CEREBRAS_API_KEY or GROQ_API_KEY in backend/.env to generate SEO',
            503
        );
    }

    const plain = String(blog.content || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 1200);

    const context = `Blog article on ${APP_NAME}.
Title: ${blog.title}
Slug: ${blog.slug}
Excerpt: ${blog.excerpt || ''}
Tags: ${(blog.tags || []).join(', ')}
Published: ${blog.published ? 'yes' : 'draft'}
Content summary: ${plain}
Canonical path should be: /blog/${blog.slug}`;

    const analyticsHint = await getAnalyticsHintForTarget({
        blogId: blog._id,
        days: 30,
    });

    const result = await generateSeoFromContext(context, analyticsHint);
    if (!result?.seo) {
        throw new ErrorHandler('AI could not produce valid SEO JSON', 502);
    }
    if (!result.seo.canonicalPath) {
        result.seo.canonicalPath = `/blog/${blog.slug}`;
    }
    if (!result.seo.ogImage && blog.coverImage) {
        result.seo.ogImage = blog.coverImage;
    }

    res.status(200).json({
        success: true,
        source: result.source,
        seo: result.seo,
    });
});

/** POST /api/v1/admin/blogs/seed — add missing posts + refresh product links */
exports.seedDummyBlogs = asyncErrorHandler(async (req, res) => {
    const Product = require('../models/productModel');
    const { buildProductLinkMap } = require('../utils/blogProductLinks');
    const { syncBlogPostsWithProductLinks } = require('../utils/syncBlogProductLinks');

    const products = await Product.find({ seedKey: { $exists: true, $ne: '' } });
    const linkMap = buildProductLinkMap(products);
    const { created, updated } = await syncBlogPostsWithProductLinks(linkMap);

    const msg =
        created || updated
            ? `Blogs: ${created} new, ${updated} updated with product links`
            : 'No blog changes';
    res.status(200).json({
        success: true,
        message: msg,
        created,
        updated,
        productLinks: Object.keys(linkMap).length,
    });
});

/** DELETE /api/v1/admin/blog/:id */
exports.deleteBlog = asyncErrorHandler(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
        return next(new ErrorHandler('Blog not found', 404));
    }
    await blog.deleteOne();
    res.status(200).json({ success: true, message: 'Blog deleted' });
});

module.exports.applyDefaultSeo = applyDefaultSeo;
