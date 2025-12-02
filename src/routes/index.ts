import { Router, Request, Response } from "express";
import OrderRoutes from "./order.route";
import DataRecordRoute from "./data-record.route";

class Routes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initialize();
    }

    private initialize() {
        // Health
        /**
         * @swagger
         * /health:
         *   get:
         *     summary: Health check
         *     responses:
         *       200:
         *         description: API is running
         */
        this.router.get("/health", (Req: Request, res: Response) => {
            res.status(200).json({ status: "OK", message: "High Perf API running" });
        });

        // Module Routes
        this.router.use("/orders", OrderRoutes);
        this.router.use("/data", DataRecordRoute);
    }
}

export default new Routes().router;
