import { OrderRepository } from "../repositories/order.repository";
import { redis } from "../utils/redis";
import { Logger } from "../logger";

export class OrderCachePreloader {
    private static instance: OrderCachePreloader;
    private readonly PAGE_SIZE = 1000;
    private readonly HOT_PAGES = 5;
    private readonly CACHE_TTL = 300;
    private readonly CACHE_PREFIX = 'orders:page';
    private readonly logger = new Logger(OrderCachePreloader.name);
    private orderRepo: OrderRepository;

    private constructor() {
        this.orderRepo = new OrderRepository();
    }

    public static getInstance(): OrderCachePreloader {
        if (!OrderCachePreloader.instance) {
            OrderCachePreloader.instance = new OrderCachePreloader();
        }
        return OrderCachePreloader.instance;
    }

    async preload() {
        try {
            for (let page = 1; page <= this.HOT_PAGES; page++) {
                const skip = (page - 1) * this.PAGE_SIZE;
                const [orders, total] = await this.orderRepo.findAll(skip, this.PAGE_SIZE);

                const payload = {
                    data: orders,
                    total,
                    page,
                    limit: this.PAGE_SIZE
                };

                const cacheKey = `${this.CACHE_PREFIX}:${page}`;
                await redis.set(cacheKey, JSON.stringify(payload), this.CACHE_TTL);
            }
            this.logger.log("Order cache preloaded successfully");
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            this.logger.error("Failed to preload order cache", errorMsg);
        }
    }
}

export const orderCachePreloader = OrderCachePreloader.getInstance();
export const getOrderCachePreloader = () => OrderCachePreloader.getInstance();