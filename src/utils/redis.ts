import Redis from "ioredis";
import { getConfig } from "../config/config";
import { Logger } from "../logger";

export class RedisClient {
    private static instance: RedisClient;
    private readonly logger = new Logger(RedisClient.name);
    public client: Redis;

    private constructor() {
        this.client = new Redis(getConfig().redisUrl, {
            maxRetriesPerRequest: null,
        });

        this.client.on("error", (err) => this.logger.error("Redis Error", err));
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    async initialize() {
        try {
            await this.client.ping();
            this.logger.log("Redis connected successfully");
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            this.logger.error("Redis connection failed", errorMsg);
            process.exit(1);
        }
    }

    getClient(): Redis {
        return this.client;
    }

    async set(key: string, value: string, expireSeconds?: number) {
        if (expireSeconds) {
            await this.client.set(key, value, "EX", expireSeconds);
        } else {
            await this.client.set(key, value);
        }
    }

    async get(key: string) {
        return this.client.get(key);
    }

    async del(key: string) {
        return this.client.del(key);
    }

    async incr(key: string) {
        return this.client.incr(key);
    }

    async incrByFloat(key: string, value: number) {
        return this.client.incrbyfloat(key, value);
    }

    pipeline() {
        return this.client.pipeline();
    }
}

export const redis = RedisClient.getInstance();
export const getRedisClient = () => RedisClient.getInstance();