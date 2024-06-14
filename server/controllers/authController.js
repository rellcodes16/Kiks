const crypto = require('crypto')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/apiError')
const cloudinary = require('../cloudinary');
const fs = require('fs');
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const sendEmail = require('../utils/email')
const uploadMiddleWare = require('../multer')

exports.upload = uploadMiddleWare('photo');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}


const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: 'None',
    }

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    
    res.cookie('jwt', token, cookieOptions)

    user.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

// exports.signup = catchAsync(async (req, res, next) => {
//     // Check if a file was uploaded
//     let photoUrl = '';
//     if (req.file) {
//         const result = await cloudinary.uploader.upload(req.file.path, {
//             folder: 'profile_pictures',
//             use_filename: true,
//             unique_filename: false,
//         });
//         photoUrl = result.secure_url;
//         await unlinkFile(req.file.path); // Remove file from server after upload
//     }

//     const newUser = await User.create({
//         name: req.body.name,
//         email: req.body.email,
//         password: req.body.password,
//         passwordConfirm: req.body.passwordConfirm,
//         photo: photoUrl,
//       });
//     createSendToken(newUser, 201, res)
// })

exports.signup = catchAsync(async (req, res, next) => {
    // Use multer to handle file upload
    exports.upload(req, res, async function (err) {
      if (err) {
        return next(new AppError(err.message, 400));
      } else {
        let photoUrl = '';
        if (req.file) {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'profile_pictures',
            use_filename: true,
            unique_filename: false,
          });
          photoUrl = result.secure_url;
          await unlinkFile(req.file.path); // Remove file from server after upload
        }
  
        const newUser = await User.create({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          passwordConfirm: req.body.passwordConfirm,
          photo: photoUrl,
        });
  
        createSendToken(newUser, 201, res);
      }
    });
  });
  

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    //1) Check if email and password exist
    if (!email && !password) {
        return next(new AppError('Please provide email and password', 400))
    }

    //2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }

    // console.log(user)

    //3) If everything is okay, send token to client
    createSendToken(user, 200, res)
})

// exports.protect = catchAsync(async (req, res, next) => {
//     let token;
//     //1 ) Getting token and check if it's there
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         token = req.headers.authorization.split(' ')[1];
//     }
//     // console.log(token)

//     if (!token) {
//         return next(new AppError('You are not logged in. Please log in to get access', 401))
//     }
//     //2) Verification token
//     const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
//     console.log(decoded)

//     //3) Check if user still exists
//     const currentUser = await User.findById(decoded.id)

//     if (!currentUser) {
//         return next(new AppError('The user belonging to the token no longer exist', 401))
//     }

//     //4) Check if user change password after the token was issued
//     // currentUser.changedPasswordAfter(decoded.iat)

//     if (currentUser.changedPasswordAfter(decoded.iat)) {
//         return next(new AppError('User recently changed password! Please log in again', 401))
//     }

//     //GRANT ACCESS TO PROTECTED ROUTE
//     req.user = currentUser;
//     next();
// })
exports.protect = catchAsync(async (req, res, next) => {
    let token;
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);

    // 1) Get token from header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    console.log('Token:', token);

    if (!token) {
        return next(new AppError('You are not logged in. Please log in to get access', 401));
    }

    // 2) Verify token
    let decoded;
    try {
        decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (err) {
        return next(new AppError('Invalid token. Please log in again.', 401));
    }
    console.log('Decoded:', decoded);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does not exist.', 401));
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});




exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles is an array ['admin', 'lead-guide']
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403))
        }

        next();
    }
}


exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    // console.log(resetURL)
    // console.log(user)

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new AppError('There was an error sending the email. Try again later!'),
            500
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1) Get user based on the token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })

    //2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 100))
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save();
    //3) Update the changePasswordAt property for the user

    //4) Log the user in, send JWT
    createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync (async (req, res, next) => {
    //1) Get user from collection
    const user = await User.findById(req.user.id).select('+password')

    //2) Check if POSTed current password is correct4
    if(!user.correctPassword(req.body.passwordCurrent, user.password)){
        return next(new AppError('Your current password is wrong', 401))
    }
 
    //3) If so, update password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save();

    //4) Log user in, send JWT
    createSendToken(user, 200, res)
})