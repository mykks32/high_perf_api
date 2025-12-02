import { WebSocketServer as WSServer, WebSocket } from "ws";
import http from "http";
import { Logger } from "../logger";

export class WebSocketServer {
    public wss: WSServer;
    private readonly logger = new Logger(WebSocketServer.name);

    constructor(server: http.Server) {
        try {
            // Create raw WebSocket server
            this.wss = new WSServer({ server });

            this.wss.on("connection", (socket: WebSocket) => {
                this.logger.log("Client connected");

                socket.on("message", (message: string) => {
                    this.logger.log(`Received message: ${message}`);
                    this.broadcast({
                        from: "client",
                        message: message.toString(),
                        timestamp: Date.now(),
                    });
                });

                socket.on("close", () => {
                    this.logger.log("Client disconnected");
                });

                socket.on("error", (err) => {
                    this.logger.error("Socket error", err);
                });
            });

            this.wss.on("error", (err) => {
                this.logger.error("WebSocketServer error", err);
            });

            this.logger.log("WebSocketServer initialized");
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            this.logger.error("Failed to initialize WebSocketServer", errorMsg);
            throw err;
        }
    }

    // Broadcast helper function
    public broadcast(data: any) {
        const message = JSON.stringify(data);
        this.wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
                client.send(message);
            }
        });
    }
}
