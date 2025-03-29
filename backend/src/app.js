import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
// import errorMiddleware from "./middlewares/errorMiddleware.js";

dotenv.config();
const app = express();
const corsOptions = {
    origin: "https://a722-58-186-166-154.ngrok-free.app",
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type,Authorization,Accept",
    credentials: true,
  };
  
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use("/api", routes);
// app.use(errorMiddleware);

export default app;
