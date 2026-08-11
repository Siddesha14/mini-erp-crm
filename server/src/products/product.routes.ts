import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
} from "./product.controller.js";
import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post(
  "/",
  authorize("ADMIN", "WAREHOUSE"),
  createProduct
);

router.put(
  "/:id",
  authorize("ADMIN", "WAREHOUSE"),
  updateProduct
);

export default router;