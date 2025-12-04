import dotenv from "dotenv";

dotenv.config({path: ".env", quiet: true});

import {AppServer} from "./src/server";
import {getConfig, ConfigService} from "./src/config/config";
import {Logger} from "./src/logger";
import http from "http";
import {WebSocketServer} from "./src/ws/webSocketServer";
import {DataWorker} from "./src/workers/dataWorker";
import {redis} from "./src/utils/redis";
import {Database} from "./src/database/database";

class Bootstrap {
    private logger: Logger;

    constructor() {
        this.logger = new Logger(Bootstrap.name);
    }

    public async start() {
        try {
            await this.startServer();
        } catch (err) {
            this.logger.error("Bootstrap failed", err);
            process.exit(1);
        }
    }

    private async startServer() {
        ConfigService.logValidation();

        this.logger.log(`Starting API Server (PID: ${process.pid})`);

        const server = new AppServer();
        await server.initialize();

        const config = getConfig();
        const port = config.port ?? 8000;

        const httpServer = http.createServer(server.app);

        // WebSocket
        const wsServer = new WebSocketServer(httpServer);

        // BullMQ Worker
        new DataWorker(wsServer);

        // Start HTTP server
        httpServer.listen(port, () => {
            this.logger.log(`API Server running on port ${port}`);
        });

        process.on("SIGTERM", () => this.shutdown("SIGTERM", httpServer));
        process.on("SIGINT", () => this.shutdown("SIGINT", httpServer));
    }

    private async shutdown(signal: string, httpServer: http.Server) {
        this.logger.log(`${signal} received, shutting down...`);

        httpServer.close(async () => {

            try {
                await redis.client.quit();
            } catch {
            }

            try {
                const db = Database.getInstance();
                if (await db.initialize()) {
                    await db.dataSource.destroy();
                }
            } catch {
            }

            this.logger.log("Shutdown complete.");
            process.exit(0);
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