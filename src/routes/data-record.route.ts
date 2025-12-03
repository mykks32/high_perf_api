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
        /**
         * @swagger
         * /data/ingest:
         *   post:
         *     summary: Ingest data (single OR batch)
         *     tags:
         *       - Data Records
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             oneOf:
         *               - type: object
         *                 example:
         *                   source: "source_1"
         *                   value: 12.5
         *                   payload:
         *                     info: "payload_1"
         *               - type: object
         *                 example:
         *                   batch:
         *                     - source: "source_1"
         *                       value: 12.5
         *                       payload:
         *                         info: "payload_1"
         *                     - source: "source_2"
         *                       value: 23.7
         *                       payload:
         *                         info: "payload_2"
         *     responses:
         *       201:
         *         description: Success
         */
        this.router.post("/ingest", this.controller.ingest);

        /**
         * @swagger
         * /data/history:
         *   get:
         *     summary: Get history of ingested data
         *     tags:
         *       - Data Records
         *     responses:
         *       200:
         *         description: Success
         */
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
         *         description: Success
         */
        this.router.get("/stats", this.controller.stats);
    }
}

export default new DataRecordRoute().router;
