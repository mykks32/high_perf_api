import {Logger} from "../logger";
import {Job, Worker} from "bullmq";
import {DataRecord} from "../entities/data-record.entity";
import {redis} from "../utils/redis";
import {AppDataSource} from "../database/data-source";

export class DataWorker {
    private readonly logger = new Logger(`${DataWorker.name}-${process.pid}`);
    private readonly worker: Worker;

    constructor() {
        this.worker = new Worker(
            "data-queue",
            async (job: Job): Promise<DataRecord> => {
                const record = job.data as DataRecord;
                try {
                    record.value = record.value + Math.random();
                    record.status = "processed";

                    await AppDataSource.getRepository(DataRecord).save(record);

                    await redis.incrAndSum("data_count", "data_sum", record.value);

                    await redis.publisher.publish("websocket-notify", JSON.stringify(record));

                    return record;
                } catch (err) {
                    this.logger.error(`Failed processing record ${record.id}`, err);
                    throw err;
                }
            },
            {
                connection: redis.getClient(),
                concurrency: 4,
                limiter: {
                    max: 4,
                    duration: 1000
                },
            }
        );

        this.worker.on("failed", (job, err) => {
            this.logger.error(`Job failed: ${job.id}`, err);
        });

        this.worker.on("error", (err) => {
            this.logger.error("Worker encountered an error", err);
        });

        this.logger.info("DataWorker initialized");
    }

    getWorker(): Worker {
        return this.worker
    }

    async close(force = true) {
        if (this.worker) {
            await this.worker.close(force);
            this.logger.info("DataWorker closed");
        }
    }
}