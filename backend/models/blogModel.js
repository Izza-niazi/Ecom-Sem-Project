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

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: 160,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            maxlength: 120,
        },
        excerpt: {
            type: String,
            trim: true,
            maxlength: 400,
        },
        content: {
            type: String,
            default: '',
        },
        coverImage: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        tags: [{ type: String, trim: true, maxlength: 40 }],
        author: {
            type: String,
            trim: true,
            maxlength: 80,
            default: 'izzmarket Team',
        },
        published: {
            type: Boolean,
            default: false,
        },
        publishedAt: {
            type: Date,
        },
        seo: {
            type: seoFieldsSchema,
            default: () => ({}),
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

blogSchema.index({ published: 1, publishedAt: -1 });
blogSchema.index({ slug: 1 });

module.exports = mongoose.model('Blog', blogSchema);
