/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment processing and verification
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentRequest:
 *       type: object
 *       required:
 *         - amount
 *         - reference
 *         - cart
 *       properties:
 *         amount:
 *           type: number
 *           description: Amount to be paid
 *         reference:
 *           type: string
 *           description: Unique payment reference ID
 *         cart:
 *           type: string
 *           format: objectId
 *           description: ID of the cart being paid for
 *       example:
 *         amount: 5000
 *         reference: "txn_1234567890"
 *         cart: "60d21b4667d0d8992e610c85"
 *
 *     PaymentResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *         user:
 *           type: string
 *           format: objectId
 *         cart:
 *           type: string
 *           format: objectId
 *         amount:
 *           type: number
 *         reference:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, success, failed]
 *           default: pending
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "64b4f84d2f4a9e001f3d7c8a"
 *         user: "64b4f84d2f4a9e001f3d7c1b"
 *         cart: "64b4f84d2f4a9e001f3d7c2c"
 *         amount: 5000
 *         reference: "txn_1234567890"
 *         status: "success"
 *         createdAt: "2025-09-16T10:20:30.000Z"
 */

/**
 * @swagger
 * /payment/create:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentRequest'
 *     responses:
 *       201:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *
 * /payment/verify:
 *   get:
 *     summary: Verify a payment by reference
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: reference
 *         schema:
 *           type: string
 *         required: true
 *         description: Payment reference to verify
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       400:
 *         description: Invalid or failed verification
 *
 * /payment/{id}:
 *   get:
 *     summary: Get a payment by ID
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: objectId
 *         required: true
 *         description: ID of the payment to retrieve
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentResponse'
 *       404:
 *         description: Payment not found
 *
 * /payment:
 *   get:
 *     summary: Get all payments for the authenticated user
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PaymentResponse'
 */
