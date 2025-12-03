import express from "express";
import baseRouter from "./routes";
import { database } from "./database/database";
import { redis } from "./utils/redis";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import { bullBoard} from "./queue/bullBoard";
import rateLimiter from "./middleware/rateLimiter.middleware"
import {swaggerService} from "./swagger/swaggerService";

export class AppServer {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.setupSwagger();
        this.setupBullBoard()
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(loggerMiddleware);
        this.app.use(rateLimiter);
    }

    private setupRoutes() {
        this.app.use("/api", baseRouter);

        // Global 404 handler (for unmatched routes)
        this.app.use((req, res) => {
            res.status(404).json({ message: "Route not found" });
        });
    }

    private setupBullBoard() {
        this.app.use("/api/queues", bullBoard.getRouter());
    }

    private setupSwagger() {
        swaggerService.setupSwagger(this.app, "/api/docs");
    }


    public async initialize() {
        await database.initialize();
        await redis.initialize();
    }
}
