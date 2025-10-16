import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import habitRoutes from "./routes/habitRoutes";
import { rateLimitMiddleware } from "./middleware/rateLimitMiddleware";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimitMiddleware);

app.use("/api", authRoutes);
app.get("/api", (req, res) => res.send("API is running..."));
app.use("/api/habits", habitRoutes);

export default app;
