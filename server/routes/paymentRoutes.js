const express = require('express')
const paymentController = require('../controllers/paymentController')
const authController = require('../controllers/authController')

const router = express.Router();

router
    .post('/create', authController.protect, paymentController.createPayment);


router
    .get('/verify', paymentController.handleCallback);

module.exports = router;