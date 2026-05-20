const Blog = require('../models/blogModel');
const Product = require('../models/productModel');
const { SAMPLE_BLOG_POSTS } = require('../data/seedBlogs');
const { applyProductLinks, buildProductLinkMap } = require('./blogProductLinks');
const { slugify } = require('./slugify');

/**
 * Upsert sample blogs and apply {{product:seedKey|label}} links.
 * @param {Record<string, string>} [linkMap]
 */
async function syncBlogPostsWithProductLinks(linkMap) {
    let map = linkMap;
    if (!map || !Object.keys(map).length) {
        const products = await Product.find({ seedKey: { $exists: true, $ne: '' } });
        map = buildProductLinkMap(products);
    }

    let created = 0;
    let updated = 0;

    for (const post of SAMPLE_BLOG_POSTS) {
        const slug = post.slug || slugify(post.title);
        const content = applyProductLinks(post.content, map);
        const existing = await Blog.findOne({ slug });

        if (existing) {
            existing.content = content;
            if (!existing.coverImage && post.coverImage) {
                existing.coverImage = post.coverImage;
            }
            await existing.save();
            updated += 1;
            continue;
        }

        await Blog.create({
            ...post,
            slug,
            content,
            publishedAt: new Date(),
            author: post.author || 'izzmarket Team',
        });
        created += 1;
    }

    return { created, updated };
}

module.exports = { syncBlogPostsWithProductLinks };
