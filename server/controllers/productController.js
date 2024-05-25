const Product = require('../models/productModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')
const { promisify } = require('util')
const uploadMiddleWare = require('../multer')
const cloudinary = require('../cloudinary');
const fs = require('fs');
const util = require('util');
const unlink = util.promisify(fs.unlink);
const AppError = require('../utils/apiError')
const uploadMultiple = require('../multerMultiple')

exports.getAllProducts = factory.getAll(Product)
exports.getProduct = factory.getOne(Product, { path: 'reviews' })

exports.createProduct = catchAsync(async (req, res, next) => {
  uploadMultiple(req, res, async function (err) {
    if (err) {
      console.log(err.message);
      return next(new AppError(err.message, 400));
    } else {
      try {
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
          // Upload each image to Cloudinary
          for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: 'cover_images',
              use_filename: true,
              unique_filename: false,
            });
            imageUrls.push(result.secure_url);
            // Remove file from server after upload
            await unlink(file.path);
          }
        }

        // Create the product using the imageUrls
        const newProduct = await Product.create({
          ...req.body,
          coverImage: imageUrls.length > 0 ? imageUrls[0] : '', // Assuming the first image is the cover image
          images: imageUrls,
        });

        // Respond with the new product
        res.status(201).json({
          status: 'success',
          data: {
            product: newProduct,
          },
        });
      } catch (error) {
        console.log(error.message);
        return next(new AppError(error.message, 500)); // Return internal server error if something goes wrong
      }
    }
  });
});


// exports.createProduct = factory.createOne(Product)

const uploadImagesToCloudinary = async (files) => {
  const imageUrls = [];
  for (const file of files) {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'cover_images',
      use_filename: true,
      unique_filename: false,
    });
    imageUrls.push(result.secure_url);
    await unlink(file.path); // Remove file from server after upload
  }
  return imageUrls;
};

exports.updateProduct = catchAsync(async (req, res, next) => {
  uploadMultiple(req, res, async function (err) {
    if (err) {
      console.error(err.message);
      return next(new AppError(err.message, 400));
    }

    try {
      // Find the product by ID
      const product = await Product.findById(req.params.id);
      if (!product) {
        return next(new AppError('Product not found', 404));
      }

      let newImageUrls = [];
      // Upload new images to Cloudinary
      if (req.files && req.files.length > 0) {
        newImageUrls = await uploadImagesToCloudinary(req.files);
      }

      // Prepare update data
      const updatedData = { ...req.body };
      if (newImageUrls.length > 0) {
        updatedData.images = [...product.images, ...newImageUrls];
        if (!req.body.coverImage) {
          updatedData.coverImage = updatedData.images[0];
        }
      }

      // Update the product using findByIdAndUpdate
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updatedData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedProduct) {
        return next(new AppError('No product found with that ID', 404));
      }

      // Respond with the updated product
      res.status(200).json({
        status: 'success',
        data: {
          product: updatedProduct,
        },
      });
    } catch (error) {
      console.error(error.message);
      return next(new AppError(error.message, 500)); // Return internal server error if something goes wrong
    }
  });
});

// exports.updateProduct = factory.updateOne(Product)

exports.deleteProduct = factory.deleteOne(Product)

exports.topTenShoes = catchAsync(async (req, res, next) => {
    const topShoes = await Product.aggregate([
        {
          $match: { ratingsAverage: { $gte: 3.5 } }
        },
        {
          $sort: { ratingsAverage: -1 }
        },
        {
          $limit: 10
        }
      ]);
    
    res.status(200).json({
        status: 'success',
        data: {
          topShoes
        }
    });
})