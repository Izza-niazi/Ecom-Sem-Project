const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            default: null,
        },
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: true,
        },
        action: {
            type: String,
            enum: ['view', 'click'],
            required: true,
        },
        source: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

userActivitySchema.index({ user: 1, createdAt: -1 });
userActivitySchema.index({ product: 1, createdAt: -1 });
userActivitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);
