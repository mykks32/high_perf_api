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
        this.router.get("/", this.controller.getOrders);
        this.router.get("/stats", this.controller.getStats);
        this.router.get("/search", this.controller.searchOrders);
        this.router.get("/:id", this.controller.getOrderById);
        this.router.post("/", this.controller.createOrders);
    }
}

export default new OrderRoutes().router;
