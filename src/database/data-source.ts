import { DataSource } from "typeorm";
import * as path from "path";
import { config } from "../config/config";
import {Order} from "../entities/order.entity";
import {DataRecord} from "../entities/data-record.entity";

export const AppDataSource = new DataSource({
    type: "postgres" as const,
    url: config.databaseUrl,
    entities: [Order, DataRecord],
    migrations: [path.join(__dirname, "./migrations/*{.ts,.js}")],
    migrationsTableName: "migrations",
    migrationsRun: true,
    subscribers: [],
    synchronize: false,
    logging: config.dbLogging,
    maxQueryExecutionTime: config.slowQueryTime,
    poolSize: config.dbPoolSize,
    extra: {
        max: config.dbPoolSize,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 20000,
    },
});
