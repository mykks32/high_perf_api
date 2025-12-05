import dotenv from "dotenv";
dotenv.config({ path: ".env", quiet: true });

import cluster from "cluster";
import os from "os";
import { Logger } from "./src/logger";
import { AppServer } from "./src/server";

class Bootstrap {
    private readonly logger = new Logger(Bootstrap.name);
    private CPU_COUNT = Math.min(4,os.cpus().length);
    private server: AppServer;

    public async start() {
        if (cluster.isPrimary) {
            this.logger.info(`MASTER PID: ${process.pid}`);
            await this.startMaster();

            process.on("SIGINT", () => this.server.shutdown());
            process.on("SIGTERM", () => this.server.shutdown());
        } else {
            this.logger.info(`WORKER PID: ${process.pid}`);
            await this.startWorker();

            process.on("SIGINT", () => this.server.shutdown());
            process.on("SIGTERM", () => this.server.shutdown());
        }
    }

    private async startMaster() {
        this.server = new AppServer(false);
        await this.server.initialize();

        for (let i = 0; i < this.CPU_COUNT; i++) {
            cluster.fork();
        }
    }

    private async startWorker() {
        this.server = new AppServer(true);
        await this.server.initialize();
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
