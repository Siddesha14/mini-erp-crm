import express from "express";
import cors from "cors";
import authRoutes from "./auth/auth.routes.js";
import { authenticate } from "./middleware/auth.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "ERP API is running",
  });
});
app.get("/api/auth/me", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      userId: req.user?.userId,
      role: req.user?.role,
    },
  });
});

app.use("/api/auth", authRoutes);

export default app;