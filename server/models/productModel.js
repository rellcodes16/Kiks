const mongoose = require('mongoose');
const slugify = require('slugify');

const sizeSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true,
        unique: true // Ensures each size is unique for a product
    },
    quantity: {
        type: Number,
        default: 0 // Default quantity is 0
    },
    price: {
        type: Number,
        required: [true, 'A product must have a price']
    },
});

const productSchema = new mongoose.Schema(
    {
        // Name of the product
        name: {
            type: String,
            required: [true, 'A product must have a name'],
            unique: true,
            trim: true,
        },
        slug: String,
        // Price of the product
        // price: {
        //     type: Number,
        //     required: [true, 'A product must have a price']
        // },
        // The description of the product
        description: {
            type: String,
            trim: true
        },
        productDetails: {
            type: [String]
        },
        category: {
            type: String
        },
        // The average of all the cumulated ratings
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
            set: val => Math.round(val * 10) / 10
        },
        // The number of ratings available
        ratingsQuantity: {
            type: Number,
            default: 0
        },
        // The thumbnail image
        coverImage: {
            type: String,
            // required: [true, 'A product must have a cover image']
        },
        // Other images in the description
        images: [String],
        // The timestamp for when the product was created
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        // Sizes with quantity and price information
        sizes: [sizeSchema]
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

productSchema.index({ slug: 1 })

//Virtual Populate
productSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'product',
    localField: '_id'
  })

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
productSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });

    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
