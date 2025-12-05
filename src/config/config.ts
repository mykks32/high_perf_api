import { envSchema, EnvSchema } from "./env.schema";
import { Logger } from "../logger";

export class ConfigService {
    private static instance: ConfigService;
    private readonly logger = new Logger(ConfigService.name);
    private env: EnvSchema;
    private initialized = false;

    private constructor() {
        const parsed = envSchema.safeParse(process.env);
        if (!parsed.success) {
            this.logger.error("Invalid environment variables", parsed.error.message);
            process.exit(1);
        }
        this.env = parsed.data;
    }

    public static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    public static logValidation(): void {
        if (!ConfigService.instance?.initialized) {
            new Logger(ConfigService.name).log("Environment variables validated");
            if (ConfigService.instance) {
                ConfigService.instance.initialized = true;
            }
        }
    }

    get port(): number {
        return Number(this.env.PORT);
    }

    get databaseUrl(): string {
        return this.env.DATABASE_URL;
    }

    get dbLogging(): boolean {
        return this.env.DB_LOGGING === "true";
    }

    get dbPoolSize(): number {
        return parseInt(this.env.DB_POOL_SIZE, 10);
    }

    get slowQueryTime(): number {
        return parseInt(this.env.SLOW_QUERY_TIME, 10);
    }

    get redisUrl(): string {
        return this.env.REDIS_URL;
    }

    get nodeEnv(): "development" | "production" {
        return this.env.NODE_ENV;
    }
}

// Export direct instance for convenience
export const config = ConfigService.getInstance();
export const getConfig = () => ConfigService.getInstance();
