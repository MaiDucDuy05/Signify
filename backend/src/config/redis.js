import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || "mystrongpassword",
  // tls: { rejectUnauthorized: false }, // Bypass SSL nếu có lỗi
  maxRetriesPerRequest: null, // Không giới hạn retry request
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redis;
