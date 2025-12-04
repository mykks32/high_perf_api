import { AppDataSource } from "./data-source";
import { Logger } from "../logger";
import "reflect-metadata";

export class Database {
    private static instance: Database;          // Singleton instance
    private readonly logger = new Logger(Database.name);
    public dataSource = AppDataSource;
    private initialized = false;                 // Prevent re-initialization

    private constructor() {} // prevent external instantiation

    static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async initialize() {
        if (this.initialized) {
            return this.dataSource;              // Already initialized → return the same one
        }

        try {
            if (!this.dataSource.isInitialized) {
                await this.dataSource.initialize();
                this.logger.log("Database connected successfully");
            }

            this.initialized = true;
            return this.dataSource;

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            this.logger.error("Database connection failed", errorMsg);
            process.exit(1);
        }
    }
}

export const database = () => Database.getInstance();