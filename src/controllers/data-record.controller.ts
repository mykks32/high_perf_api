import { Logger } from "../logger";
import { DataRecordService } from "../services/data-record.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { ingestSingleSchema, ingestBatchSchema, getHistorySchema } from "../schemas/data-record.schema";

const { OK, CREATED, BAD_REQUEST, INTERNAL_SERVER_ERROR } = StatusCodes;

class DataRecordController {
    private readonly logger = new Logger(DataRecordController.name);
    private readonly service: DataRecordService;

    constructor() {
        this.service = new DataRecordService();
    }

    public ingest = async (req: Request, res: Response) => {
        try {
            if (Array.isArray(req.body.batch)) {
                const batch = ingestBatchSchema.parse(req.body.batch);
                const records = await this.service.ingestBatch(batch);
                return res.status(CREATED).json({
                    success: true,
                    message: "Batch records queued successfully",
                    data: records.map(r => r.id),
                });
            }

            const single = ingestSingleSchema.parse(req.body);
            const { source, value, payload } = single;

            const record = await this.service.ingestSingle(source, value, payload);
            return res.status(CREATED).json({
                success: true,
                message: "Record queued successfully",
                data: { id: record.id },
            });

        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.issues,
                });
            }

            this.logger.error("Error in ingest API", error);
            return res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Something went wrong",
            });
        }
    };

    public stats = async (_req: Request, res: Response) => {
        try {
            const stats = await this.service.getStats();
            return res.status(OK).json({ success: true, data: stats });
        } catch (error) {
            this.logger.error("Error fetching stats", error);
            return res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Something went wrong",
            });
        }
    };

    public history = async (req: Request, res: Response) => {
        try {
            const parsedQuery = getHistorySchema.parse(req.query); // { limit?: number }
            const { limit } = parsedQuery;

            const history = await this.service.getHistory(limit);
            return res.status(OK).json({ success: true, data: history });
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(BAD_REQUEST).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.issues,
                });
            }

            this.logger.error("Error fetching history", error);
            return res.status(INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Something went wrong",
            });
        }
    };
}

export default DataRecordController;