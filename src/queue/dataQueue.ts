import { Queue } from "bullmq";
import { Logger } from "../logger";
import { DataRecord } from "../entities/data-record.entity";
import { redis } from "../utils/redis";

export class DataQueue {
    private static instance: DataQueue;
    public readonly queue: Queue;
    private readonly logger = new Logger(DataQueue.name);

    private constructor() {
        try {
            this.queue = new Queue<DataRecord>("data-queue", { connection: redis.getClient() });
            this.logger.info("BullMQ queue initialized");
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            this.logger.error("Failed to initialize DataQueue", errorMsg);
            throw err;
        }
    }

    public static getInstance(): DataQueue {
        if (!DataQueue.instance) {
            DataQueue.instance = new DataQueue();
        }
        return DataQueue.instance;
    }

    async addRecord(record: DataRecord) {
        try {
            await this.queue.add("process-record", record, {
                attempts: 3,
                removeOnComplete: { age: 3600 },
                backoff: { type: "exponential", delay: 500 },
            });
            this.logger.info(`Enqueued record ${record.id}`);
        } catch (err) {
            this.logger.error(`Failed to enqueue record ${record.id}`, err);
            throw err;
        }
    }

    async addBatch(records: DataRecord[]) {
        for (const record of records) {
            try {
                await this.addRecord(record);
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : String(err);
                this.logger.error(`Failed to enqueue batch record ${record.id}`, errorMsg);
            }
        }
    }
}

export const getDataQueue = () => DataQueue.getInstance();