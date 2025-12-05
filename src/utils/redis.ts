import Redis from "ioredis";
import { getConfig } from "../config/config";
import { Logger } from "../logger";

export class RedisClient {
    private static instance: RedisClient;
    private readonly logger = new Logger(RedisClient.name);
    private readonly pool: Redis[] = [];
    private readonly poolSize = 10;
    private index = 0;

    public subscriber: Redis;
    public publisher: Redis;

    private constructor() {
        for (let i = 0; i < this.poolSize; i++) {
            const client = new Redis(getConfig().redisUrl, {
                maxRetriesPerRequest: null,
                enableOfflineQueue: true,
                lazyConnect: false,
                connectTimeout: 5000,
                retryStrategy: (times) => Math.min(times * 50, 2000),
            });

            client.on("error", (err) => this.logger.error(`Redis Error [client-${i}]`, err));

            this.pool.push(client);
        }

        this.publisher = new Redis(getConfig().redisUrl);
        this.subscriber = new Redis(getConfig().redisUrl);

        this.publisher.on("error", (err) => this.logger.error("Redis Pub Error", err));
        this.subscriber.on("error", (err) => this.logger.error("Redis Sub Error", err));
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    async initialize() {
        try {
            await Promise.all(this.pool.map(async (r) => {
                if (r.status !== "ready" && r.status !== "connecting") {
                    await r.connect();
                }
            }));

            if (this.publisher.status !== "ready" && this.publisher.status !== "connecting") {
                await this.publisher.connect();
            }

            if (this.subscriber.status !== "ready" && this.subscriber.status !== "connecting") {
                await this.subscriber.connect();
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            this.logger.error("Redis connection failed", errorMsg);
            process.exit(1);
        }
    }

    public getClient(): Redis {
        const client = this.pool[this.index];
        this.index = (this.index + 1) % this.poolSize; // Round-robin
        return client;
    }

    async set(key: string, value: string, expireSeconds?: number) {
        const client = this.getClient();
        if (expireSeconds) {
            await client.set(key, value, "EX", expireSeconds);
        } else {
            await client.set(key, value);
        }
    }

    async get(key: string) {
        return this.getClient().get(key);
    }

    async incrAndSum(countKey: string, sumKey: string, value: number) {
        const pipe = this.getClient().pipeline();
        pipe.incr(countKey);
        pipe.incrbyfloat(sumKey, value);
        await pipe.exec();
    }

    public async disconnectAll() {
        for (const client of this.pool) {
            client.disconnect();
        }
        this.publisher.disconnect();
        this.subscriber.disconnect();
    }
}

export const redis = RedisClient.getInstance();
export const getRedisClient = () => RedisClient.getInstance();