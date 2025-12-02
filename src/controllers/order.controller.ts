import {OrderService} from "../services/order.service";
import {Request, Response} from "express";
import {Logger} from "../logger";
import {
    createOrderSchema,
    createOrdersSchema,
    getOrderByIdSchema,
    GetOrdersInput,
    getOrdersSchema,
    searchOrdersSchema
} from "../schemas/order.schema";
import {PaginatedOrders} from "../interfaces/order.interface";
import {ZodError} from "zod";
import {StatusCodes} from "http-status-codes";
import {redis, RedisClient} from "../utils/redis";
import {id} from "zod/locales";

const {
    OK,
    INTERNAL_SERVER_ERROR,
    BAD_REQUEST,
    NOT_FOUND
} = StatusCodes;


class OrderController {
    private readonly logger = new Logger(OrderController.name);
    private readonly orderService: OrderService;
    private readonly redis: RedisClient
    private readonly CACHE_TTL = 300;
    private readonly CACHE_PREFIX = 'orders';

    constructor() {
        this.orderService = new OrderService();
        this.redis = redis;
    }

    public getOrders = async (req: Request, res: Response) => {
        try {
            // Validate
            const parsedQuery: GetOrdersInput = getOrdersSchema.parse(req.query);

            // Cache
            const cacheKey = `${this.CACHE_PREFIX}:${JSON.stringify(parsedQuery)}`
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                this.logger.info(`Cache hit for key: ${cacheKey}`);
                const parsed = JSON.parse(cachedData);
                return res.status(OK).json({
                    ...parsed,
                    cached: true,
                });
            }

            // Service
            const orders: PaginatedOrders = await this.orderService.getOrders(parsedQuery.page, parsedQuery.limit);

            const responsePayload = {
                success: true,
                data: orders.data,
                page: orders.page,
                limit: orders.limit,
                total: orders.total,
            };

            // Cache result
            await this.redis.set(cacheKey, JSON.stringify(responsePayload), this.CACHE_TTL);
            this.logger.info(`Cached orders with key: ${cacheKey}`);

            return res.status(OK).json({
                ...responsePayload,
                cached: false,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(BAD_REQUEST).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.issues,
                });
            }

            console.error(error);
            return res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Something went wrong',
            });
        }
    };

    public getOrderById = async (req: Request, res: Response) => {
        try {
            // Validate
            const parsedParams = getOrderByIdSchema.parse(req.params);
            const {id} = parsedParams;

            // Cache
            const cacheKey = `${this.CACHE_PREFIX}:${id}`;
            const cachedData = await this.redis.get(cacheKey);
            if (cachedData) {
                this.logger.info(`Cache hit for order ID: ${id}`);
                return res.status(OK).json({
                    success: true,
                    data: JSON.parse(cachedData),
                    cached: true,
                });
            }

            // service
            const order = await this.orderService.getOrderById(id);

            if (!order) {
                return res.status(NOT_FOUND).json({
                    success: false,
                    message: `Order not found with ID: ${id}`,
                });
            }

            // Cache result
            await this.redis.set(cacheKey, JSON.stringify(order), this.CACHE_TTL);
            this.logger.info(`Cached order with key: ${cacheKey}`);

            return res.status(OK).json({
                success: true,
                data: order,
                cached: false,
            });
        } catch (error) {

            if (error instanceof ZodError) {
                return res.status(BAD_REQUEST).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.issues,
                });
            }

            this.logger.error(error);
            return res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Something went wrong',
            });
        }
    }

    public getStats = async (req: Request, res: Response) => {
        try {
            // cache
            const cacheKey = `${this.CACHE_PREFIX}:stats`;
            const cachedData = await this.redis.get(cacheKey);
            if (cachedData) {
                this.logger.info(`Cache hit for stats`);
                return res.status(OK).json({
                    success: true,
                    data: JSON.parse(cachedData),
                    cached: true,
                });
            }

            // Fetch stats from service
            const stats = await this.orderService.getStats();

            // Cache stats
            await this.redis.set(cacheKey, JSON.stringify(stats), this.CACHE_TTL);
            this.logger.info("Cached stats data");

            return res.status(OK).json({
                success: true,
                data: stats,
                cached: false,
            });

        } catch (error) {
            this.logger.error(error);
            return res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Something went wrong",
            });
        }
    };


    public createOrders = async (req: Request, res: Response) => {
        try {
            const body = Array.isArray(req.body)
                ? createOrdersSchema.parse(req.body)
                : [createOrderSchema.parse(req.body)];

            // Create orders
            const result = await this.orderService.createOrders(body);

            return res.status(StatusCodes.CREATED).json({
                success: true,
                message: "Order(s) created successfully",
                data: result
            });

        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.issues
                });
            }

            this.logger.error(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Something went wrong"
            });
        }
    };

    public searchOrders = async (req: Request, res: Response) => {
        try {
            // Validate
            const parsedQuery = searchOrdersSchema.parse(req.query);
            const {q, page, limit} = parsedQuery;

            // Cache key
            const cacheKey = `${this.CACHE_PREFIX}:search:${q}:page:${page}:limit:${limit}`;
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                this.logger.info(`Cache hit for search: ${q}`);
                return res.status(OK).json({
                    success: true,
                    ...JSON.parse(cached),
                    cached: true,
                });
            }

            // Fetch result
            const result = await this.orderService.searchOrders(q, page, limit);

            // Structure response
            const responsePayload = {
                data: result.data,
                total: result.total,
                page: result.page,
                limit: result.limit,
            };

            // Cache response
            await this.redis.set(cacheKey, JSON.stringify(responsePayload), this.CACHE_TTL);

            return res.status(OK).json({
                success: true,
                ...responsePayload,
                cached: false,
            });
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.name,
                });
            }

            this.logger.error(error);

            return res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Something went wrong",
            });
        }
    };
}

export default OrderController;