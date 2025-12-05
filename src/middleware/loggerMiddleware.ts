import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { Logger } from "../logger";

export class LoggerMiddleware {
    private readonly logger = new Logger(LoggerMiddleware.name);

    handle = (req: Request, res: Response, next: NextFunction): void => {
        if (req.path.startsWith("/api/queues")) return next();

        const requestId = (req.headers["x-request-id"] as string) || uuidv4();
        req.headers["x-request-id"] = requestId;
        res.setHeader("x-request-id", requestId);

        const { method, originalUrl } = req;
        const start = Date.now();

        this.logger.info(`Incoming request: ${method} ${originalUrl}`, { requestId, method, path: originalUrl });

        res.on("finish", () => {
            const { statusCode } = res;
            const duration = Date.now() - start;

            this.logger.info(
                `${method} ${originalUrl} - Status: ${statusCode} - Duration: ${duration}ms`,
                { requestId, statusCode, duration, method, path: originalUrl }
            );
        });

        next();
    };
}

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    return new LoggerMiddleware().handle(req, res, next);
};