const mongoose = require('mongoose');
const Product = require('./productModel')

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty']     
        },
        rating: {
            type: Number,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0']
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product',
            required: [true, 'Review must belong to a product']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

reviewSchema.index({ product: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    })

    next()
})

reviewSchema.statics.calcAverageRatings = async function(productId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: {
                _id: '$product',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]) 
    console.log(stats)

    if(stats.length > 0){
        await Product.findByIdAndUpdate(productId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating,
        })
    }
    else{
        await Product.findByIdAndUpdate(productId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }


}

reviewSchema.post('save', function() {
    //this points to current review

    this.constructor.calcAverageRatings(this.product)
})

// findOneAndUpdate
// findOneAndDelete

// reviewSchema.pre(/^findOneAnd/, async function(next) {
//     this.review = await this.findOne()
//     console.log(this.review)
//     next()
// })

// reviewSchema.post(/^findOneAnd/, async function() {
//     // await this.findOne does not work here, the query has already executed
//     await this.review.constructor.calcAverageRatings(this.review.product)
// })

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.review = await this.model.findOne(this.getQuery());
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    if (this.review) {
        await this.review.constructor.calcAverageRatings(this.review.product);
    }
});


const Review = mongoose.model('Review', reviewSchema)

module.exports = Review