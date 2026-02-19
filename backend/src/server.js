import http from "http";
import app from "./app.js";
import { initWebSocket } from "./websocket/websocket.js";
import { initDB } from "./database/index.js";
import { fileURLToPath } from 'url';
import path from 'path';

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startServer = async () => {
    try {
        console.log("🔄 Initializing database...");
        await initDB();
        console.log("✅ Database initialized successfully.");
        const server = http.createServer(app);

        server.listen(PORT, HOST, () => {
            console.log(`Server running on port ${PORT}`);
        });

        initWebSocket(server);

        server.on("error", (error) => {
            console.error("Server error:", error);
            process.exit(1);
        });

    } catch (error) {
        console.error("Fatal error during startup:", error);
        process.exit(1);
    }
};

startServer();