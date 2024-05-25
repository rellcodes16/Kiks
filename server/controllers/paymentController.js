const Paystack = require('paystack');
const Cart = require('../models/cartModel');
const Payment = require('../models/paymentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/apiError');
const https = require('https')

// Initialize Paystack
const paystack = Paystack(process.env.PAYSTACK_SECRET_KEY);

const request = require('request'); 

exports.createPayment = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    const authToken = req.headers.authorization;
    // console.log(authToken)

    request.get({
        url: 'http://127.0.0.1:3000/api/v1/cart',
        headers: {
            'Authorization': authToken 
        }
    }, async (error, response, body) => {
        if (error) {
            return next(new AppError('Error fetching cart details', 500));
        }

        // console.log('Response Status Code:', response.statusCode);
        // console.log('Response Body:', body);

        if (response.statusCode !== 200) {
            return next(new AppError('Failed to fetch cart details', response.statusCode));
        }

        const cart = JSON.parse(body);
        // console.log(cart)

        const totalAmount = cart.data.totalAmount * 100;

        const { email } = req.user;
        const paymentData = {
            email: email,
            amount: totalAmount,
            callback_url: `${process.env.PAYSTACK_CALLBACK_URL}/payment/verify`
        };

        paystack.transaction.initialize(paymentData, async (error, body) => {
            console.log(paymentData)
            console.log('Paystack Response Body:', body);
            if (error) {
                return next(new AppError('Payment initialization failed', 500));
            }

            const ID = cart.data._id

            // console.log('ID:', cart.data._id)

            const payData = await Payment.create({
                user: userId,
                cart: ID,
                reference: body.data.reference,
                amount: totalAmount,
                status: 'pending'
            });

            // console.log(payData)

            // Send the authorization URL to the frontend
            res.status(200).json({
                status: 'success',
                data: body.data
            });
        });
    });
});


exports.handleCallback = catchAsync(async (req, res, next) => {
    const { reference } = req.query;

    // Verify the payment with Paystack
    const options = {
        hostname: 'api.paystack.co',
        path: `/transaction/verify/${reference}`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
    };

    https.get(options, (paystackRes) => { 
        let data = '';

        paystackRes.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received.
        paystackRes.on('end', async () => {
            const paymentData = JSON.parse(data);
            
            if (!paymentData.status) {
                return next(new AppError('Payment verification failed', 400));
            }

            const { amount, reference, status } = paymentData.data;

            const payment = await Payment.findOne({ reference });
            console.log(payment)
            if (!payment) {
                return next(new AppError('Payment not found', 404));
            }

            payment.status = status === 'success' ? 'success' : 'failed';
            await payment.save();

            if (status === 'success') {
                console.log(Cart)
                const cart = await Cart.findById(payment.cart);
                console.log(cart)
                if (!cart) {
                    return next(new AppError('Cart not found', 404));
                }

                cart.isPaid = true;
                await cart.save();
            }

            res.status(200).json({
                status: 'success',
                message: 'Payment verified successfully',
                data: paymentData.data
            });
        });
    }).on('error', (error) => {
        return next(new AppError('Payment verification failed', 500));
    });
});
