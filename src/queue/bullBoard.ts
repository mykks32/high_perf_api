import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import express from "express";

import {dataQueue, DataQueue} from "./dataQueue";
import {Logger} from "../logger";

export class BullBoard {
    private readonly serverAdapter: ExpressAdapter;
    private readonly dataQueue: DataQueue;
    private readonly logger = new Logger(BullBoard.name);

    constructor() {
        try {
            this.dataQueue = dataQueue;
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
        }
    }

    public getRouter(): express.Router {
        return this.serverAdapter.getRouter();
    }
}

export const bullBoard = new BullBoard();