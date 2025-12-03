import express from "express";
import baseRouter from "./routes";
import {database} from "./database/database";
import {redis, getRedisClient} from "./utils/redis";
import {loggerMiddleware} from "./middleware/loggerMiddleware";
import {getBullBoard} from "./queue/bullBoard";
import rateLimiter from "./middleware/rateLimiter.middleware";
import {swaggerService} from "./swagger/swaggerService";
import {getOrderCachePreloader} from "./cache/orderCachePreloader";

export class AppServer {
    public app: express.Application;
    private readonly isPrimary: boolean;

    constructor(isPrimary: boolean = false) {
        this.isPrimary = isPrimary;
        this.app = express();

        this.setupMiddleware();
        this.setupRoutes();

        // Only setup primary-only services
        if (isPrimary) {
            this.setupSwagger();
            this.setupBullBoard();
        }
    }

    private setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(loggerMiddleware);
        this.app.use(rateLimiter);
    }

    private setupRoutes() {
        this.app.use("/api", baseRouter);

        // Global 404 handler (for unmatched routes)
        this.app.use((req, res) => {
            res.status(404).json({message: "Route not found"});
        });
    }

    private setupBullBoard() {
        // Use getter function for lazy initialization
        this.app.use("/api/queues", getBullBoard().getRouter());
    }

    private setupSwagger() {
        swaggerService.setupSwagger(this.app, "/api/docs");
    }

    public async initialize() {
        // Only initialize these on primary process
        if (this.isPrimary) {
            await database.initialize();
            await redis.initialize();
            await getOrderCachePreloader().preload();
        } else {
            // Workers only need minimal setup
            getRedisClient();
        }
    }
}