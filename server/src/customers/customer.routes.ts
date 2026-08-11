import { Router } from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  addFollowUp,
} from "./customer.controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getCustomers);

router.get("/:id", getCustomerById);

router.post(
  "/",
  authorize("ADMIN", "SALES"),
  createCustomer
);

router.put(
  "/:id",
  authorize("ADMIN", "SALES"),
  updateCustomer
);

router.post(
  "/:id/followups",
  authorize("ADMIN", "SALES"),
  addFollowUp
);

export default router;