import { DataSource } from "typeorm";
import * as path from "path";
import { getConfig } from "../config/config";
import {Order} from "../entities/order.entity";
import {DataRecord} from "../entities/data-record.entity";

export const AppDataSource = new DataSource({
    type: "postgres" as const,
    url: getConfig().databaseUrl,
    entities: [Order, DataRecord],
    migrations: [path.join(__dirname, "./migrations/*{.ts,.js}")],
    migrationsTableName: "migrations",
    migrationsRun: true,
    subscribers: [],
    synchronize: false,
    logging: getConfig().dbLogging,
    maxQueryExecutionTime: getConfig().slowQueryTime,
    poolSize: getConfig().dbPoolSize,
    extra: {
        max: getConfig().dbPoolSize,
        min: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 20000,
    },
});
