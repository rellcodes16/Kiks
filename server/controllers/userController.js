const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync')
const { promisify } = require('util')
const AppError = require('../utils/apiError')
const factory = require('./handlerFactory')
const uploadMiddleWare = require('../multer')
const cloudinary = require('../cloudinary');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);

exports.upload = uploadMiddleWare('photo');
 
const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el]
  })

  return newObj;
}

exports.getAllUsers = factory.getAll(User)

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next()
}

exports.updateMe = catchAsync(async(req, res, next) => {
  // 1) Create an error if user POSTs password data
  if(req.body.password || req.body.passwordConfirm){
    return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400))
  }

  //2) Filtered out unwanted fields name that are not all allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email')

  // 3) Handle file upload if present
  exports.upload(req, res, async function (err) {
    if (err) {
        return next(new AppError(err.message, 400));
    } else {
        if (req.file) {
            // Delete the existing photo from Cloudinary (if present)
            const user = await User.findById(req.user.id);
            if (user.photo) {
                const publicId = user.photo.split('/').pop().split('.')[0]; // Extract the public ID
                await cloudinary.uploader.destroy(`profile_pictures/${publicId}`);
            }

            // Upload the new photo to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'profile_pictures',
                use_filename: true,
                unique_filename: false,
            });
            filteredBody.photo = result.secure_url;
            await unlinkFile(req.file.path); // Remove file from server after upload
        }

        // 4) Update user document
        const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser,
            }
        });
    }
});
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null
  })
})

exports.getUser = factory.getOne(User)

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined: Please use /signup instead'
  });
};

exports.updateUserPhoto = catchAsync(async (req, res, next) => {
  // Use multer to handle file upload
  exports.upload(req, res, async function (err) {
    if (err) {
      return next(new AppError(err.message, 400));
    } else {
      // 1) Handle file upload if present
      if (req.file) {
        // Find the user by ID
        const user = await User.findById(req.params.id);
        if (!user) {
          return next(new AppError('No user found with that ID', 404));
        }

        // Delete the existing photo from Cloudinary if present
        if (user.photo) {
          const publicId = user.photo.split('/').pop().split('.')[0]; // Extract the public ID
          await cloudinary.uploader.destroy(`profile_pictures/${publicId}`);
        }

        // Upload the new photo to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'profile_pictures',
          use_filename: true,
          unique_filename: false,
        });

        // Update the user's photo link in the database
        user.photo = result.secure_url;

        // Save the updated user object to the database
        await user.save({ validateBeforeSave: false });

        // Remove file from server after upload
        await unlinkFile(req.file.path); 
      }

      // Proceed to the next middleware
      next();
    }
  });
});


exports.updateUser = factory.updateOne(User)

exports.deleteUser = factory.deleteOne(User)