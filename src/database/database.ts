import { AppDataSource } from "./data-source";
import { Logger } from "../logger";
import "reflect-metadata"

export class Database {
    private readonly logger = new Logger(Database.name);
    public dataSource = AppDataSource;

    async initialize() {
        try {
            await this.dataSource.initialize();
            this.logger.log("Database connected successfully");
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            this.logger.error("Database connection failed", errorMsg);
            process.exit(1);
        }
    }
}

export const database = new Database();
