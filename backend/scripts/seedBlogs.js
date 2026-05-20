/**
 * Refresh blog posts and internal product links. Run: npm run seed:blogs
 * Tip: run `npm run seed` first to ensure demo products exist.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', 'backend', '.env') });

const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const Product = require('../models/productModel');
const { buildProductLinkMap } = require('../utils/blogProductLinks');
const { syncBlogPostsWithProductLinks } = require('../utils/syncBlogProductLinks');

(async () => {
    try {
        await connectDatabase();
        const products = await Product.find({ seedKey: { $exists: true, $ne: '' } });
        const linkMap = buildProductLinkMap(products);
        if (!Object.keys(linkMap).length) {
            console.warn('No seeded products found — run: npm run seed');
        }
        const { created, updated } = await syncBlogPostsWithProductLinks(linkMap);
        console.log(`Done. Blogs: ${created} new, ${updated} updated. Product links: ${Object.keys(linkMap).length}`);
        process.exit(0);
    } catch (e) {
        console.error(e.message || e);
        process.exit(1);
    } finally {
        await mongoose.disconnect().catch(() => {});
    }
})();
