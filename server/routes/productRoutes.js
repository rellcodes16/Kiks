const express = require('express')
const productController = require('../controllers/productController')
const authController = require('../controllers/authController')
const reviewRouter = require('./reviewRoutes')

const router = express.Router()


router.use('/:productId/reviews', reviewRouter)

router
    .route('/top-ten-shoes')
    .get(productController.topTenShoes)

router
    .route('/')
    .get(productController.getAllProducts)
    .post(authController.protect, authController.restrictTo('admin'), productController.createProduct)

router
    .route('/:id')
    .get(productController.getProduct)
    .patch(authController.protect, authController.restrictTo('admin'), productController.updateProduct)
    .delete(authController.protect, authController.restrictTo('admin'),productController.deleteProduct)

module.exports = router;