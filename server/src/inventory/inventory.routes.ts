import { Router } from "express";
import {
  createStockMovement,
  getStockMovements,
} from "./inventory.controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/movements", getStockMovements);

router.post(
  "/movements",
  authorize("ADMIN", "WAREHOUSE"),
  createStockMovement
);

export default router;