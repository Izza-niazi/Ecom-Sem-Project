const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema(
    {
        path: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        pageType: {
            type: String,
            enum: ['home', 'static', 'listing', 'product', 'blog', 'blog_list', 'other'],
            default: 'other',
        },
        entityId: {
            type: mongoose.Schema.ObjectId,
            default: null,
        },
        entityKey: {
            type: String,
            trim: true,
            maxlength: 120,
        },
        sessionId: {
            type: String,
            trim: true,
            maxlength: 64,
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            default: null,
        },
        referrer: {
            type: String,
            trim: true,
            maxlength: 500,
        },
    },
    { timestamps: true }
);

pageViewSchema.index({ path: 1, createdAt: -1 });
pageViewSchema.index({ pageType: 1, createdAt: -1 });
pageViewSchema.index({ entityId: 1, createdAt: -1 });
pageViewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PageView', pageViewSchema);
