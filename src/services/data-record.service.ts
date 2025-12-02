import { Logger } from "../logger";
import { DataRecordRepository } from "../repositories/data-record.repository";
import { DataRecord } from "../entities/data-record.entity";
import { dataQueue, DataQueue } from "../queue/dataQueue";
import { redis } from "../utils/redis";
import crypto from "crypto";

export class DataRecordService {
    private readonly logger = new Logger(DataRecordService.name);
    private readonly queue: DataQueue;
    private readonly repo: DataRecordRepository;

    constructor() {
        this.queue = dataQueue;
        this.repo = new DataRecordRepository();
    }

    async ingestSingle(source: string, value: number, payload?: object) {
        const record = new DataRecord();
        record.id = crypto.randomUUID();
        record.source = source;
        record.value = value;
        record.payload = payload || null;
        record.status = "pending";

        await this.queue.addRecord(record);

        this.logger.log(`Ingesting record: ${record.id}`);
        return record;
    }

    async ingestBatch(recordsData: { source: string; value: number; payload?: object }[]) {
        const records = recordsData.map(d => {
            const r = new DataRecord();
            r.id = crypto.randomUUID();
            r.source = d.source;
            r.value = d.value;
            r.payload = d.payload || null;
            r.status = "pending";
            return r;
        });

        await this.queue.addBatch(records);

        this.logger.log(`Ingesting batch: ${records.length}`);
        return records;
    }

    async getStats() {
        const count = parseInt((await redis.get("data_count")) || "0");
        const sum = parseFloat((await redis.get("data_sum")) || "0");
        const avg = count > 0 ? sum / count : 0;

        this.logger.log(`Stats fetched: count=${count}, sum=${sum}, avg=${avg}`);
        return { count, sum, avg };
    }

    async getHistory(limit: number = 100) {
        return this.repo.findHistory(limit);
    }
}