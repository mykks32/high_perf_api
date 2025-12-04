import "reflect-metadata";
import express from "express";
import baseRouter from "./routes";
import { Database } from "./database/database";
import { redis } from "./utils/redis";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import { getBullBoard } from "./queue/bullBoard";
import rateLimiter from "./middleware/rateLimiter.middleware";
import { swaggerService } from "./swagger/swaggerService";
import { getOrderCachePreloader } from "./cache/orderCachePreloader";

export class AppServer {
    public app: express.Application;

    constructor() {
        this.app = express();
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

        this.setupSwagger();
        this.setupBullBoard();

        // 404
        this.app.use((req, res) => {
            res.status(404).json({ message: "Route not found" });
        });
    }

    private setupBullBoard() {
        this.app.use("/api/queues", getBullBoard().getRouter());
    }

    private setupSwagger() {
        swaggerService.setupSwagger(this.app, "/api/docs");
    }

    public async initialize() {
        // Initialize DB using Singleton
        await Database.getInstance().initialize();

        // Initialize Redis
        await redis.initialize();

        // Preload cache
        await getOrderCachePreloader().preload();
    }
}