import dotenv from "dotenv";
dotenv.config({ path: ".env", quiet: true });

import "reflect-metadata";
import { AppServer } from "./src/server";
import { getConfig, ConfigService } from "./src/config/config";
import { Logger } from "./src/logger";
import http from "http";
import { WebSocketServer } from "./src/ws/webSocketServer";
import { DataWorker } from "./src/workers/dataWorker";
import cluster from "cluster";
import os from "os";

const numCPUs = os.cpus().length;
const NUM_WORKERS = Math.min(5, numCPUs);

class Bootstrap {
    private logger: Logger;

    constructor() {
        this.logger = new Logger(Bootstrap.name);
    }

    public async start() {
        try {
            if (cluster.isPrimary) {
                await this.startPrimary();
            } else {
                await this.startWorker();
            }
        } catch (err) {
            this.logger.error("Bootstrap failed", err);
            process.exit(1);
        }
    }

    private async startPrimary() {
        // Log config validation only on primary
        ConfigService.logValidation();

        this.logger.log(`Primary process ${process.pid} is running`);

        // Initialize primary server with BullBoard setup
        const server = new AppServer(true);
        await server.initialize();

        // Fork workers
        for (let i = 0; i < NUM_WORKERS; i++) {
            cluster.fork();
        }

        // Handle worker exit and restart
        cluster.on("exit", (worker, code, signal) => {
            this.logger.log(
                `Worker ${worker.process.pid} died (${signal || code}). Restarting...`
            );
            cluster.fork();
        });

        // Graceful shutdown
        const shutdown = (signal: string) => {
            this.logger.log(`${signal} received, shutting down gracefully...`);
            for (const id in cluster.workers) {
                cluster.workers[id]?.kill();
            }
            process.exit(0);
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
    }

    private async startWorker() {
        const workerId = cluster.worker?.id;
        const config = getConfig();

        // Initialize worker server without BullBoard
        const server = new AppServer(false);
        const appServer = server.app;
        const port = config.port ?? 8000;

        const httpServer = http.createServer(appServer);

        // Only first worker handles WebSocket and DataWorker
        if (workerId === 1) {
            const wsServer = new WebSocketServer(httpServer);
            new DataWorker(wsServer);
        }

        httpServer.listen(port, () => {
            this.logger.log(
                `Worker: ${process.pid} API SERVER RUNNING ON PORT: ${port}`
            );
        });
    }
}

(async () => {
    try {
        await new Bootstrap().start();
    } catch (err) {
        console.error("Failed to start application:", err);
        process.exit(1);
    }
})();