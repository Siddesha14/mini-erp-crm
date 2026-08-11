import { Router } from "express";
import {
  createChallan,
  getChallans,
  getChallanById,
  updateChallan,
  confirmChallan,
  cancelChallan,
} from "./challan.controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

// View challans
router.get("/", getChallans);

router.get("/:id", getChallanById);

// Sales + Admin can create/edit challans
router.post(
  "/",
  authorize("ADMIN", "SALES"),
  createChallan
);

router.put(
  "/:id",
  authorize("ADMIN", "SALES"),
  updateChallan
);

// Confirming/cancelling is an operational action.
// Admin + Sales can perform it.
router.post(
  "/:id/confirm",
  authorize("ADMIN", "SALES"),
  confirmChallan
);

router.post(
  "/:id/cancel",
  authorize("ADMIN", "SALES"),
  cancelChallan
);

export default router;