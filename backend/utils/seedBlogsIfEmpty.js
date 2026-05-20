const Blog = require('../models/blogModel');
const Product = require('../models/productModel');
const { SAMPLE_BLOG_POSTS } = require('../data/seedBlogs');
const { slugify } = require('./slugify');
const { applyProductLinks, buildProductLinkMap } = require('./blogProductLinks');

/**
 * Insert dummy blog posts when the collection is empty (dev/demo).
 * @returns {Promise<number>} count created
 */
async function seedBlogsIfEmpty() {
    const count = await Blog.countDocuments();
    if (count > 0) {
        return 0;
    }

    const products = await Product.find({ seedKey: { $exists: true, $ne: '' } });
    const linkMap = buildProductLinkMap(products);

    let created = 0;
    for (const post of SAMPLE_BLOG_POSTS) {
        const slug = post.slug || slugify(post.title);
        const content = applyProductLinks(post.content, linkMap);
        await Blog.create({
            ...post,
            slug,
            content,
            publishedAt: new Date(Date.now() - created * 86400000),
            author: post.author || 'izzmarket Team',
        });
        created += 1;
    }
    if (created > 0) {
        console.log(`Blog: seeded ${created} dummy post(s) for /blog`);
    }
    return created;
}

module.exports = { seedBlogsIfEmpty };
