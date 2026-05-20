const mongoose = require('mongoose');

const seoFieldsSchema = new mongoose.Schema(
    {
        pageTitle: { type: String, trim: true, maxlength: 70 },
        metaDescription: { type: String, trim: true, maxlength: 320 },
        keywords: { type: String, trim: true, maxlength: 500 },
        ogTitle: { type: String, trim: true, maxlength: 95 },
        ogDescription: { type: String, trim: true, maxlength: 200 },
        ogImage: { type: String, trim: true, maxlength: 500 },
        robots: { type: String, trim: true, maxlength: 80, default: 'index, follow' },
        canonicalPath: { type: String, trim: true, maxlength: 500 },
    },
    { _id: false }
);

const pageSeoSchema = new mongoose.Schema(
    {
        pageKey: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 64,
        },
        seo: {
            type: seoFieldsSchema,
            default: () => ({}),
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('PageSeo', pageSeoSchema);
