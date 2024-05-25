const Cart = require("../models/cartModel")
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/apiError");

exports.getCart = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
        return next(new AppError('Cart Not Found', 404))
    }

    res.status(200).json({ 
        status: 'success', 
        data: cart 
    });
})

exports.addToCart = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const { items } = req.body;
  
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
    }

    for (const item of items) {
      const { productId, size, quantity } = item;
    //   console.log(item)
    //   console.log(productId)
  
      const product = await Product.findById(productId);
    //   console.log(product)
      if (!product) {
        return next(new AppError(`Product with ID ${productId} not found`, 404));
      }
  
      const selectedSize = product.sizes.find(s => s.size === size);
      if (!selectedSize) {
        return next(new AppError(`Size ${size} not found for product with ID ${productId}`, 404));
      }
      const price = selectedSize.price;
  
      const existingItemIndex = cart.items.findIndex(
        existingItem => existingItem.productId.toString() === productId && existingItem.size === size
      );
  
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, size, quantity, price });
      }
    }

    cart.totalAmount = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  
    await cart.save();
  
    res.status(200).json({
      status: 'success',
      data: cart
    });
});

exports.updateCart = catchAsync(async(req, res, next) => {
    const userId = req.user._id;
    const { id } = req.params;
    const { quantity } = req.body;


    const cart = await Cart.findOneAndUpdate(
        { 
            user: userId, 
            'items._id': id
        },
        { 
            $set: { 
                'items.$.quantity': quantity 
            }
        },
        { new: true }
    );

    // Update the total amount
    cart.totalAmount = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ 
        status: 'success', 
        data: cart 
    });
})

exports.deleteCartItem = catchAsync (async(req, res, next) => {
    const userId = req.user._id;
    const { id } = req.params;
  
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new AppError('Cart Not Found', 404));
    }
    const itemIndex = cart.items.findIndex(item => item._id.toString() === id);
    if (itemIndex === -1) {
      return next(new AppError('Item Not Found In Cart', 404));
    }

    cart.items.splice(itemIndex, 1);

    cart.totalAmount = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

    await cart.save();

    res.status(204).json({ 
        status: 'success', 
        data: null
    });
})