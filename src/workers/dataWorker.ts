import { Logger } from "../logger";
import { Job, Worker } from "bullmq";
import { DataRecord } from "../entities/data-record.entity";
import { redis } from "../utils/redis";
import { AppDataSource } from "../database/data-source";
import { WebSocketServer } from "../ws/webSocketServer";
import {database} from "../database/database";
import cluster from "cluster";

export class DataWorker {
    private readonly logger = new Logger(DataWorker.name);

    constructor(private wsServer: WebSocketServer) {
        const worker = new Worker(
            "data-queue",
            async (job: Job): Promise<DataRecord> => {
                const record = job.data as DataRecord;
                this.logger.log(`Processing record ${record.id}`);

                try {
                    const workerId = cluster.worker?.id
                    record.value = record.value + Math.random();
                    record.status = "processed";

                    await database().initialize()
                    await AppDataSource.getRepository(DataRecord).save(record);

                    await redis.incr("data_count");
                    await redis.incrByFloat("data_sum", record.value);

                    this.wsServer.broadcast({
                        event: "data:processed",
                        data: record,
                        workerId
                    });

                    this.logger.log(`Record ${record.id} processed and broadcasted`);
                    return record;
                } catch (err) {
                    this.logger.error(`Failed processing record ${record.id}`, err);
                    throw err;
                }
            },
            {
                connection: redis.client,
                concurrency: 2,
                limiter: {
                    max: 2,
                    duration: 1000
                },
            }
        );

        worker.on("failed", (job, err) => {
            this.logger.error(`Job failed: ${job.id}`, err);
        });

        worker.on("error", (err) => {
            this.logger.error("Worker encountered an error", err);
        });

        this.logger.log("DataWorker initialized");
    }
}