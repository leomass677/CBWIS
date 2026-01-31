import express from "express";
import * as transactionController from "../controllers/transactionController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/in", verifyToken, transactionController.recordGoodsIn);
router.post("/out", verifyToken, transactionController.recordGoodsOut);
router.get("/", verifyToken, transactionController.getTransactions);
router.get(
  "/item/:itemId",
  verifyToken,
  transactionController.getItemTransactions
);
router.get(
  "/range",
  verifyToken,
  transactionController.getTransactionsByDateRange
);

export default router;
