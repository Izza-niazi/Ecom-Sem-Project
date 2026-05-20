const Product = require('../models/productModel');
const User = require('../models/userModel');
const { SAMPLE_PRODUCTS, toProductDocument } = require('../data/seedProducts');
const { buildProductLinkMap } = require('./blogProductLinks');

/**
 * @param {{ updateExisting?: boolean }} opts
 * @returns {Promise<{ created: number, updated: number, linkMap: Record<string,string> }>}
 */
async function seedProducts(opts = {}) {
    const { updateExisting = true } = opts;

    let owner = await User.findOne({ role: 'admin' }).select('_id');
    if (!owner) {
        owner = await User.findOne().select('_id');
    }
    if (!owner) {
        throw new Error('No user in database — register an account first, then run seed.');
    }

    let created = 0;
    let updated = 0;

    for (const raw of SAMPLE_PRODUCTS) {
        const doc = toProductDocument(raw, owner._id);
        const existing = await Product.findOne({ seedKey: raw.seedKey });

        if (existing) {
            if (updateExisting) {
                existing.name = doc.name;
                existing.description = doc.description;
                existing.category = doc.category;
                existing.price = doc.price;
                existing.cuttedPrice = doc.cuttedPrice;
                existing.stock = doc.stock;
                existing.ratings = doc.ratings;
                existing.numOfReviews = doc.numOfReviews;
                existing.highlights = doc.highlights;
                existing.specifications = doc.specifications;
                existing.images = doc.images;
                existing.brand = doc.brand;
                if (!existing.seo?.pageTitle) {
                    existing.seo = doc.seo;
                }
                existing.seo = existing.seo || {};
                existing.seo.canonicalPath = `/product/${existing._id}`;
                await existing.save();
                updated += 1;
            }
            continue;
        }

        const product = await Product.create(doc);
        product.seo = product.seo || {};
        product.seo.canonicalPath = `/product/${product._id}`;
        await product.save();
        created += 1;
    }

    const seeded = await Product.find({ seedKey: { $in: SAMPLE_PRODUCTS.map((p) => p.seedKey) } });
    const linkMap = buildProductLinkMap(seeded);

    if (created > 0 || updated > 0) {
        console.log(`Products: ${created} created, ${updated} updated (${seeded.length} demo SKUs)`);
    }

    return { created, updated, linkMap };
}

module.exports = { seedProducts, SAMPLE_PRODUCTS };
