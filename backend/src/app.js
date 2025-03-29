import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
// import errorMiddleware from "./middlewares/errorMiddleware.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", routes);
// app.use(errorMiddleware);

export default app;
