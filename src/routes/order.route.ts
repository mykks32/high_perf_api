import { Router } from "express";
import OrderController from "../controllers/order.controller";

class OrderRoutes {
    public router: Router;
    private controller: OrderController;

    constructor() {
        this.router = Router();
        this.controller = new OrderController();
        this.initialize();
    }

    private initialize() {
        /**
         * @swagger
         * /api/orders:
         *   get:
         *     summary: Get all orders
         *     tags:
         *       - Orders
         *     parameters:
         *       - in: query
         *         name: page
         *         schema:
         *           type: integer
         *           default: 1
         *         description: Page number
         *       - in: query
         *         name: limit
         *         schema:
         *           type: integer
         *           default: 50
         *         description: Number of records per page
         *     responses:
         *       200:
         *         description: Success
         */
        this.router.get("/", this.controller.getOrders);

        /**
         * @swagger
         * /api/orders/stats:
         *   get:
         *     summary: Get statistics of orders
         *     tags:
         *       - Orders
         *     responses:
         *       200:
         *         description: Success
         */
        this.router.get("/stats", this.controller.getStats);

        /**
         * @swagger
         * /api/orders/search:
         *   get:
         *     summary: Search orders
         *     tags:
         *       - Orders
         *     parameters:
         *       - in: query
         *         name: q
         *         schema:
         *           type: string
         *         description: Search query
         *       - in: query
         *         name: page
         *         schema:
         *           type: integer
         *           default: 1
         *         description: Page number
         *       - in: query
         *         name: limit
         *         schema:
         *           type: integer
         *           default: 50
         *         description: Number of results per page
         *     responses:
         *       200:
         *         description: Success
         */
        this.router.get("/search", this.controller.searchOrders);

        /**
         * @swagger
         * /api/orders/{id}:
         *   get:
         *     summary: Get order by ID
         *     tags:
         *       - Orders
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *         description: Order ID
         *     responses:
         *       200:
         *         description: Success
         */
        this.router.get("/:id", this.controller.getOrderById);

        /**
         * @swagger
         * /api/orders:
         *   post:
         *     summary: Create new orders
         *     tags:
         *       - Orders
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: array
         *             items:
         *               type: object
         *               properties:
         *                 userId:
         *                   type: string
         *                 productName:
         *                   type: string
         *                 description:
         *                   type: string
         *                 totalAmount:
         *                   type: number
         *                 status:
         *                   type: string
         *     responses:
         *       200:
         *         description: Success
         */
        this.router.post("/", this.controller.createOrders);
    }
}

export default new OrderRoutes().router;
