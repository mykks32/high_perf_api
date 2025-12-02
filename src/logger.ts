import * as fs from "fs";
import * as path from "path";
import { createLogger, format, Logger as WinstonLogger, transports } from "winston";

export class Logger {
    private logger: WinstonLogger;
    private logDir = "logs";

    constructor(private context: string) {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }

        const logFile = path.join(
            this.logDir,
            `${new Date().toISOString().split("T")[0]}.log`
        );

        const logFormat = format.printf(({ timestamp, level, message, ...meta }) => {
            const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : "";
            return `[${timestamp}] [${this.context}] [${level.toUpperCase()}]: ${message}${metaString ? ` ${metaString}` : ""}`;
        });

        this.logger = createLogger({
            level: "debug",
            format: format.combine(
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                logFormat
            ),
            transports: [
                new transports.Console({
                    format: format.combine(
                        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                        logFormat,
                        format.colorize()
                    ),
                    level: "debug",
                }),
                new transports.File({ filename: logFile, level: "debug" })
            ]
        });
    }

    log(message: string, ...meta: unknown[]): void {
        this.logger.info(message, { meta: meta.length === 1 ? meta[0] : meta });
    }

    error(message: string, ...meta: unknown[]): void {
        this.logger.error(message, { meta: meta.length === 1 ? meta[0] : meta });
    }

    warn(message: string, ...meta: unknown[]): void {
        this.logger.warn(message, { meta: meta.length === 1 ? meta[0] : meta });
    }

    debug(message: string, ...meta: unknown[]): void {
        this.logger.debug(message, { meta: meta.length === 1 ? meta[0] : meta });
    }

    info(message: string, ...meta: unknown[]): void {
        this.logger.info(message, { meta: meta.length === 1 ? meta[0] : meta });
    }
}