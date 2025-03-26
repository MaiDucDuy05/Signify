import http from "http";
import app from "./app.js";
import { initWebSocket } from "./websocket.js";
import { initDB } from "./postgres/index.js";

const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0";

const startServer = async () => {
    try {
        console.log("🔄 Initializing database...");
        await initDB();
        console.log("✅ Database initialized successfully.");

        const server = http.createServer(app);

        server.listen(PORT, HOST, () => {
            console.log(`Server running on port ${PORT}`);
        });

        // initWebSocket(server);
        
        // server.on("error", (error) => {
        //     console.error("Server error:", error);
        //     process.exit(1); // Graceful exit on fatal error
        // });

    } catch (error) {
        console.error("Fatal error during startup:", error);
        process.exit(1);
    }
};

startServer();
