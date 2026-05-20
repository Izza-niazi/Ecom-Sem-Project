/**
 * Seed demo products only. Run: npm run seed:products
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', 'backend', '.env') });

const mongoose = require('mongoose');
const connectDatabase = require('../config/database');
const { seedProducts } = require('../utils/seedProducts');

(async () => {
    try {
        await connectDatabase();
        const { created, updated } = await seedProducts({ updateExisting: true });
        console.log(`Done. Products: ${created} new, ${updated} updated.`);
        process.exit(0);
    } catch (e) {
        console.error(e.message || e);
        process.exit(1);
    } finally {
        await mongoose.disconnect().catch(() => {});
    }
})();
