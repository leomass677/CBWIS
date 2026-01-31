import { db } from "../config/firebase.js";

// Record goods in
export const recordGoodsIn = async (req, res) => {
  try {
    const { itemId, quantity, performedBy } = req.body;

    if (!itemId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid item or quantity" });
    }

    // Get current item
    const itemDoc = await db.collection("inventory").doc(itemId).get();
    if (!itemDoc.exists) {
      return res.status(404).json({ error: "Item not found" });
    }

    const itemData = itemDoc.data();
    const currentQuantity = itemData.quantity || 0;

    // Create transaction record
    const transaction = {
      itemId,
      itemName: itemData.itemName,
      transactionType: "IN",
      quantity: parseInt(quantity),
      performedBy,
      timestamp: new Date().toISOString(),
    };

    await db.collection("transactions").add(transaction);

    // Update inventory
    await db
      .collection("inventory")
      .doc(itemId)
      .update({
        quantity: currentQuantity + parseInt(quantity),
      });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    console.error("Error recording goods in:", error);
    res.status(500).json({ error: error.message });
  }
};

// Record goods out
export const recordGoodsOut = async (req, res) => {
  try {
    const { itemId, quantity, performedBy } = req.body;

    if (!itemId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: "Invalid item or quantity" });
    }

    // Get current item
    const itemDoc = await db.collection("inventory").doc(itemId).get();
    if (!itemDoc.exists) {
      return res.status(404).json({ error: "Item not found" });
    }

    const itemData = itemDoc.data();
    const currentQuantity = itemData.quantity || 0;

    if (currentQuantity < quantity) {
      return res.status(400).json({ error: "Insufficient stock" });
    }

    // Create transaction record
    const transaction = {
      itemId,
      itemName: itemData.itemName,
      transactionType: "OUT",
      quantity: parseInt(quantity),
      performedBy,
      timestamp: new Date().toISOString(),
    };

    await db.collection("transactions").add(transaction);

    // Update inventory
    await db
      .collection("inventory")
      .doc(itemId)
      .update({
        quantity: currentQuantity - parseInt(quantity),
      });

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    console.error("Error recording goods out:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all transactions
export const getTransactions = async (req, res) => {
  try {
    const snapshot = await db.collection("transactions").get();
    const transactions = [];
    snapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    // Sort by timestamp descending
    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get transactions for specific item
export const getItemTransactions = async (req, res) => {
  try {
    const { itemId } = req.params;

    const snapshot = await db
      .collection("transactions")
      .where("itemId", "==", itemId)
      .get();

    const transactions = [];
    snapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching item transactions:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get transactions by date range
export const getTransactionsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = db.collection("transactions");

    if (startDate) {
      query = query.where("timestamp", ">=", startDate);
    }

    if (endDate) {
      query = query.where("timestamp", "<=", endDate);
    }

    const snapshot = await query.get();
    const transactions = [];

    snapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions by date:", error);
    res.status(500).json({ error: error.message });
  }
};
