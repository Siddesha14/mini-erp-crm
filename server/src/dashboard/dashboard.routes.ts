import { Router } from "express";
import { getDashboardSummary } from "./dashboard.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get(
  "/summary",
  authenticate,
  getDashboardSummary
);

export default router;