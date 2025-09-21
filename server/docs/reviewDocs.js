/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product review management and retrieval
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - review
 *         - rating
 *         - product
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Auto-generated ID of the review
 *         review:
 *           type: string
 *           description: The review text
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating given by the user
 *         createdAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: string
 *           format: objectId
 *           description: ID of the user who created the review
 *         product:
 *           type: string
 *           format: objectId
 *           description: ID of the product being reviewed
 *       example:
 *         _id: "652f3a2d2c7b5a12f8a9b3e7"
 *         review: "Great product, really loved it!"
 *         rating: 5
 *         createdAt: "2025-09-16T12:45:00.000Z"
 *         user: "64fa9f8d2c7b5a12f8a9b3e7"
 *         product: "64fa9f8d2c7b5a12f8a9b3e8"
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: List of all reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *
 *   post:
 *     summary: Create a new review (1 review per user per product)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - review
 *               - rating
 *               - product
 *             properties:
 *               review:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               product:
 *                 type: string
 *                 format: objectId
 *             example:
 *               review: "Solid quality, would recommend."
 *               rating: 4
 *               product: "64fa9f8d2c7b5a12f8a9b3e8"
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 */

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get a single review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Review details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       404:
 *         description: Review not found
 *
 *   patch:
 *     summary: Update a review by ID (only by the author)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               review:
 *                 type: string
 *               rating:
 *                 type: number
 *             example:
 *               review: "After a week of use, still holding up well."
 *               rating: 5
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *
 *   delete:
 *     summary: Delete a review by ID
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       204:
 *         description: Review deleted successfully
 */
