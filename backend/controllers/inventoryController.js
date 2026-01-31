import { db } from "../config/firebase.js";

// Get all inventory items
export const getInventory = async (req, res) => {
  try {
    const snapshot = await db.collection("inventory").get();
    const items = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    res.json(items);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get single inventory item
export const getInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("inventory").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create inventory item
export const createInventoryItem = async (req, res) => {
  try {
    const { itemName, category, supplier, quantity, unitPrice } = req.body;

    if (!itemName || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newItem = {
      itemName,
      category,
      supplier: supplier || "",
      quantity: parseInt(quantity) || 0,
      unitPrice: parseFloat(unitPrice) || 0,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("inventory").add(newItem);
    res.status(201).json({ id: docRef.id, ...newItem });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update inventory item
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, category, supplier, quantity, unitPrice } = req.body;

    const updateData = {};
    if (itemName) updateData.itemName = itemName;
    if (category) updateData.category = category;
    if (supplier !== undefined) updateData.supplier = supplier;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (unitPrice !== undefined) updateData.unitPrice = parseFloat(unitPrice);

    await db.collection("inventory").doc(id).update(updateData);
    res.json({ success: true, id, ...updateData });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete inventory item
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if there are transactions for this item
    const transSnapshot = await db
      .collection("transactions")
      .where("itemId", "==", id)
      .get();

    if (!transSnapshot.empty) {
      return res.status(400).json({
        error:
          "Cannot delete item with existing transactions. Delete transactions first.",
      });
    }

    await db.collection("inventory").doc(id).delete();
    res.json({ success: true, id });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({ error: error.message });
  }
};
