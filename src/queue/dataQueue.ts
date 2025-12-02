import {Queue} from "bullmq";
import {Logger} from "../logger";
import {DataRecord} from "../entities/data-record.entity";
import {redis} from "../utils/redis";

export class DataQueue {
    public readonly queue: Queue;
    private readonly logger = new Logger(DataQueue.name);

    constructor() {
        try {
            this.queue = new Queue<DataRecord>("data-queue", {connection: redis.client});
            this.logger.log("BullMQ queue initialized");
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            this.logger.error("Failed to initialize DataQueue", errorMsg);
            throw err;
        }
    }

    async addRecord(record: DataRecord) {
        try {
            await this.queue.add("process-record", record, {
                attempts: 3,
                removeOnComplete: {age: 3600},
                backoff: {type: "exponential", delay: 500},
            });
            this.logger.log(`Enqueued record ${record.id}`);
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

export const dataQueue = new DataQueue();
