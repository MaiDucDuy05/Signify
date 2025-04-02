import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
// import errorMiddleware from "./middlewares/errorMiddleware.js";
dotenv.config();
const app = express();
const REACT_API =  process.env.REACT_API

// const corsOptions = {
//   // origin: `${REACT_API}`,
//   origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "Accept", "ngrok-skip-browser-warning"],
//   credentials: true
// };

const corsOptions = {
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "ngrok-skip-browser-warning"],
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); 
app.use(express.json());
app.use("/api", routes);

// app.use(errorMiddleware);
export default app;


