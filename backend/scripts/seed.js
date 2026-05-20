/**
 * Seed demo products (with stable seedKey) and refresh blog internal links.
 * Run: npm run seed
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', 'backend', '.env') });

const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const { seedProducts } = require('../utils/seedProducts');
const { syncBlogPostsWithProductLinks } = require('../utils/syncBlogProductLinks');

(async () => {
    try {
        await connectDatabase();
        const { created, updated, linkMap } = await seedProducts({ updateExisting: true });
        const blogSync = await syncBlogPostsWithProductLinks(linkMap);
        console.log(
            `Done. Products: +${created} new, ${updated} updated. Blogs: ${blogSync.created} new, ${blogSync.updated} link refresh.`
        );
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err.message || err);
        process.exit(1);
    } finally {
        await mongoose.disconnect().catch(() => {});
    }
})();
