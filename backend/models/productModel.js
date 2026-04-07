const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema(
    {
        pageTitle: { type: String, trim: true, maxlength: 70 },
        metaDescription: { type: String, trim: true, maxlength: 320 },
        keywords: { type: String, trim: true, maxlength: 500 },
        ogTitle: { type: String, trim: true, maxlength: 95 },
        ogDescription: { type: String, trim: true, maxlength: 200 },
        robots: { type: String, trim: true, maxlength: 80, default: 'index, follow' },
        canonicalPath: { type: String, trim: true, maxlength: 500 },
    },
    { _id: false }
);

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product name"],
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true,
    },
    highlights: [
        {
            type: String,
            required: true
        }
    ],
    specifications: [
        {
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                default: '',
                trim: true,
            }
        }
    ],
    price: {
        type: Number,
        required: [true, "Please enter product price"]
    },
    cuttedPrice: {
        type: Number,
        required: [true, "Please enter cutted price"]
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    brand: {
        name: {
            type: String,
            required: true
        },
        logo: {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            }
        }
    },
    category: {
        type: String,
        required: [true, "Please enter product category"]
    },
    stock: {
        type: Number,
        required: [true, "Please enter product stock"],
        maxlength: [4, "Stock cannot exceed limit"],
        default: 1
    },
    warranty: {
        type: Number,
        default: 1
    },
    ratings: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],

    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    seo: {
        type: seoSchema,
        default: () => ({}),
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);