import express from "express";
import * as inventoryController from "../controllers/inventoryController.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, inventoryController.getInventory);
router.get("/:id", verifyToken, inventoryController.getInventoryItem);
router.post(
  "/",
  verifyToken,
  verifyAdmin,
  inventoryController.createInventoryItem
);
router.put(
  "/:id",
  verifyToken,
  verifyAdmin,
  inventoryController.updateInventoryItem
);
router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  inventoryController.deleteInventoryItem
);

export default router;
