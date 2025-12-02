import { Repository } from "typeorm";
import { AppDataSource } from "../database/data-source";
import { DataRecord } from "../entities/data-record.entity";

export class DataRecordRepository {
    private readonly repo: Repository<DataRecord>;

    constructor() {
        this.repo = AppDataSource.getRepository(DataRecord);
    }

    async save(record: DataRecord): Promise<DataRecord> {
        return this.repo.save(record);
    }

    async saveBatch(records: DataRecord[]): Promise<DataRecord[]> {
        return this.repo.save(records);
    }

    async findHistory(limit: number = 100): Promise<DataRecord[]> {
        return this.repo.find({
            order: { createdAt: "DESC" },
            take: limit,
        });
    }

    async countAll(): Promise<number> {
        return this.repo.count();
    }

    async sumValues(): Promise<number> {
        const result = await this.repo
            .createQueryBuilder("record")
            .select("SUM(record.value)", "sum")
            .getRawOne();
        return parseFloat(result.sum) || 0;
    }
}