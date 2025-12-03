import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import express from "express";
import { Logger } from "../logger";
import { DataQueue } from "./dataQueue";

export class BullBoard {
    private static instance: BullBoard;
    private readonly serverAdapter: ExpressAdapter;
    private readonly dataQueue: DataQueue;
    private readonly logger = new Logger(BullBoard.name);

    private constructor() {
        try {
            this.dataQueue = DataQueue.getInstance();
            this.serverAdapter = new ExpressAdapter();
            this.serverAdapter.setBasePath("/api/queues");

            createBullBoard({
                queues: [
                    new BullMQAdapter(this.dataQueue.queue)
                ],
                serverAdapter: this.serverAdapter
            });

            this.logger.log("BullBoard initialized successfully");
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            this.logger.error("Failed to initialize BullBoard", errorMsg);
            throw err;
        }
    }

    public static getInstance(): BullBoard {
        if (!BullBoard.instance) {
            BullBoard.instance = new BullBoard();
        }
        return BullBoard.instance;
    }

    public getRouter(): express.Router {
        return this.serverAdapter.getRouter();
    }
}

export const getBullBoard = () => BullBoard.getInstance();