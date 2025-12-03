import { z } from "zod";

export const envSchema = z.object({
    DATABASE_URL: z.string(),
    PORT: z.string(),
    DB_LOGGING: z.string().default("false"),
    DB_POOL_SIZE: z.string().default("20"),
    SLOW_QUERY_TIME: z.string().default("1000"),
    REDIS_URL: z.string(),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
});

export type EnvSchema = z.infer<typeof envSchema>;
