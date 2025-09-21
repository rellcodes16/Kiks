/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - productId
 *         - size
 *         - quantity
 *         - price
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *         productId:
 *           type: string
 *           format: objectId
 *           description: The ID of the product
 *         size:
 *           type: string
 *           description: Selected size of the product
 *         quantity:
 *           type: number
 *           description: Quantity of the product
 *           minimum: 1
 *         price:
 *           type: number
 *           description: Price of the product at the time of adding to cart
 *       example:
 *         _id: "64fa9f8d2c7b5a12f8a9b3e9"
 *         productId: "643e3c9f1c23a4b5f89f12cd"
 *         size: "Large"
 *         quantity: 2
 *         price: 2500
 *
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *         user:
 *           type: string
 *           format: objectId
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         totalAmount:
 *           type: number
 *           description: Total value of all items in the cart
 *         isPaid:
 *           type: boolean
 *           description: Indicates if the cart has been checked out/paid
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "64fa9f8d2c7b5a12f8a9b3d1"
 *         user: "64fa9f8d2c7b5a12f8a9b3c2"
 *         items:
 *           - _id: "64fa9f8d2c7b5a12f8a9b3e9"
 *             productId: "643e3c9f1c23a4b5f89f12cd"
 *             size: "Medium"
 *             quantity: 1
 *             price: 2500
 *         totalAmount: 2500
 *         isPaid: false
 *         createdAt: "2025-09-16T10:20:30.000Z"
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get the current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *
 *   post:
 *     summary: Add an item to the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - size
 *               - price
 *             properties:
 *               productId:
 *                 type: string
 *                 format: objectId
 *               size:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 default: 1
 *               price:
 *                 type: number
 *             example:
 *               productId: "643e3c9f1c23a4b5f89f12cd"
 *               size: "Large"
 *               quantity: 1
 *               price: 2500
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */

/**
 * @swagger
 * /cart/{itemId}:
 *   patch:
 *     summary: Update a cart item (quantity or size)
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *               size:
 *                 type: string
 *             example:
 *               quantity: 3
 *               size: "XL"
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       204:
 *         description: Cart item deleted successfully
 */
