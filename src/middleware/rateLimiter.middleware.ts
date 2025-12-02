import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

export class RateLimiter {
    private static instance: RateLimiter;
    public limiter: RateLimitRequestHandler;

    private constructor() {
        this.limiter = rateLimit({
            windowMs: 1000,
            limit: 1000,
            standardHeaders: true,
            legacyHeaders: false,
            message: "Too many requests from this IP, please try again later.",
        });
    }

    public static getInstance(): RateLimiter {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter();
        }
        return RateLimiter.instance;
    }
}

export default RateLimiter.getInstance().limiter;