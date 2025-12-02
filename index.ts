import "reflect-metadata";
import { AppServer } from "./src/server";
import { config } from "./src/config/config";
import { Logger } from "./src/logger";
import http from "http";
import { WebSocketServer } from "./src/ws/webSocketServer";
import { DataWorker } from "./src/workers/dataWorker";
import cluster from "cluster";
import os from "os";

const numCPUs = os.cpus().length;

class Bootstrap {
    private logger: Logger;
    private server: AppServer;

    constructor() {
        this.logger = new Logger(Bootstrap.name);
        this.server = new AppServer();
    }

    public async start() {
        try {
            // if (cluster.isPrimary) {
            //     this.logger.log(`Primary process ${process.pid} is running`);
            //
            //     // Fork workers (use numCPUs or fixed number)
            //     for (let i = 0; i < Math.min(5, numCPUs); i++) {
            //         cluster.fork();
            //     }
            //
            //     cluster.on("exit", (worker) => {
            //         this.logger.log(`Worker ${worker.process.pid} died. Restarting...`);
            //         cluster.fork();
            //     });
            // } else {
                await this.server.initialize();
                const appServer = this.server.app;
                const port = config.port ?? 8000;

                // HTTP Server
                const httpServer = http.createServer(appServer);

                // // WebSocket Server (only first worker handles WS)
                // let wsServer: WebSocketServer | undefined;
                // if (cluster.worker?.id === 1) {
                    const wsServer = new WebSocketServer(httpServer);
                // }

                // DataWorker
                new DataWorker(wsServer);

                // Start HTTP server
                httpServer.listen(port, () => {
                    this.logger.log(`API SERVER RUNNING ON PORT: ${port}`);
                });
            // }
        } catch (err) {
            this.logger.error("Bootstrap failed", err);
            process.exit(1);
        }
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