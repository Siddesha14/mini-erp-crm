import express from "express";
import cors from "cors";
import authRoutes from "./auth/auth.routes.js";
import { authenticate } from "./middleware/auth.middleware.js";
import customerRoutes from "./customers/customer.routes.js";
import productRoutes from "./products/product.routes.js";
import inventoryRoutes from "./inventory/inventory.routes.js";
import challanRoutes from "./challans/challan.routes.js";

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


app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/challans", challanRoutes);


app.get("/api/auth/me", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      userId: req.user?.userId,
      role: req.user?.role,
    },
  });
});

export default app;