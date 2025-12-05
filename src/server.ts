import "reflect-metadata";
import express, {Request, Response} from "express";
import http from "http";
import baseRouter from "./routes";
import {database, Database} from "./database/database";
import {redis} from "./utils/redis";
import {loggerMiddleware} from "./middleware/loggerMiddleware";
import rateLimiter from "./middleware/rateLimiter.middleware";
import {getBullBoard} from "./queue/bullBoard";
import {swaggerService} from "./swagger/swaggerService";
import {WebSocketServer} from "./ws/webSocketServer";
import {DataWorker} from "./workers/dataWorker";
import {Logger} from "./logger";
import {config} from "./config/config";

export class AppServer {
    public app: express.Application;
    private httpServer?: http.Server;
    private wsServer?: WebSocketServer;
    private dataWorker?: DataWorker;
    private logger = new Logger(AppServer.name);
    private readonly isWorker: boolean;

    constructor(isWorker: boolean) {
        this.isWorker = isWorker;
        this.app = express();
        this.setupMiddleware();
        if (!isWorker) this.setupRoutes();
    }

    private setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(loggerMiddleware);
        this.app.use(rateLimiter);
    }

    private setupRoutes() {
        this.app.use("/api", baseRouter);

        this.setupSwagger();
        this.setupBullBoard();

        this.app.use((req: Request, res: Response) => {
            res.status(404).json({message: "Route not found"});
        });
    }

    private setupBullBoard() {
        this.app.use("/api/queues", getBullBoard().getRouter());
    }

    private setupSwagger() {
        swaggerService.setupSwagger(this.app, "/api/docs");
    }

    public async initialize() {
        if (this.isWorker) {
            await Database.getInstance().initialize();
            this.dataWorker = new DataWorker();
        } else {
            await redis.initialize();
            await database().initialize()

            // Server Setup
            this.httpServer = http.createServer(this.app);
            this.wsServer = new WebSocketServer(this.httpServer);

            // IPC
            this.setupRedisWSBridge();

            const port = config.port ||  8000;
            this.httpServer.listen(port, () => {
                this.logger.info(`API Server running on port ${port}`);
            });
        }
    }

    private setupRedisWSBridge() {
        const sub = redis.subscriber;

        sub.subscribe("websocket-notify");

        sub.on("message", (_, message) => {
            try {
                const parsed = JSON.parse(message);
                this.wsServer?.broadcast({
                    event: "data-processed",
                    payload: parsed,
                    timestamp: Date.now()
                });
            } catch (_) {
                this.wsServer?.broadcast({
                    event: "data-processed",
                    payload: message,
                    timestamp: Date.now()
                });
            }
        });
    }

    public async shutdown() {
        try {
            if (this.dataWorker?.getWorker()) {
                await this.dataWorker.close(true);
            }

            if (this.httpServer) {
                await new Promise<void>((resolve) => this.httpServer?.close(() => resolve()));
            }

            if (redis) {
                await redis.disconnectAll();
            }
            const db = Database.getInstance();
            if (db.dataSource?.isInitialized) {
                await db.dataSource.destroy();
            }

            this.logger.info("Server shutdown completed");
        } catch (err) {
            this.logger.error("Shutdown error", err);
        } finally {
            process.exit(0);
        }
    }
}
