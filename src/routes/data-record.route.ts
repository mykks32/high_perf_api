import {Router} from "express";
import DataRecordController from "../controllers/data-record.controller";

class DataRecordRoute {
    public router: Router;
    private controller: DataRecordController;

    constructor() {
        this.router = Router();
        this.controller = new DataRecordController();
        this.initialize();
    }

    private initialize() {
        this.router.post("/ingest", this.controller.ingest);
        this.router.get("/history", this.controller.history);
        /**
         * @swagger
         * /data/stats:
         *   get:
         *     summary: Get statistics of ingested data
         *     tags:
         *       - Data Records
         *     responses:
         *       200:
         *         description: Data statistics (count, sum, avg)
         */
        this.router.get("/stats", this.controller.stats);
    }
}

export default new DataRecordRoute().router;
