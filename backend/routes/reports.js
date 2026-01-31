import express from "express";
import * as reportController from "../controllers/reportController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/inventory", verifyToken, reportController.getInventoryReport);
router.get(
  "/transactions",
  verifyToken,
  reportController.getTransactionSummary
);
router.get("/dashboard", verifyToken, reportController.getDashboardStats);

export default router;
