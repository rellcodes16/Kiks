const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [
    {
      productId: { 
        type: mongoose.Schema.ObjectId, 
        ref: 'Product', 
        required: true 
      },
      size: {
        type: String,
        required: true
      },
      quantity: {
        type: Number, 
        default: 1, 
        min: 1 
      },
      price: {
        type: Number,
        required: true
      },
    }
  ],
  totalAmount: {
    type: Number,
    default: 0
  },
  isPaid: {
    type: Boolean,
    default: false
  }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
