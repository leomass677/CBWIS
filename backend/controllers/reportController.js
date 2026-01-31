import { db } from "../config/firebase.js";

// Get inventory report
export const getInventoryReport = async (req, res) => {
  try {
    const snapshot = await db.collection("inventory").get();
    const items = [];
    let totalValue = 0;
    let lowStockCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      items.push({ id: doc.id, ...data });
      totalValue += (data.quantity || 0) * (data.unitPrice || 0);
      if ((data.quantity || 0) < 10) {
        lowStockCount++;
      }
    });

    res.json({
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      totalValue,
      lowStockItems: lowStockCount,
      items,
    });
  } catch (error) {
    console.error("Error generating inventory report:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get transaction summary
export const getTransactionSummary = async (req, res) => {
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
    let totalIn = 0;
    let totalOut = 0;
    const byItem = {};
    const byDate = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const date =
        data.timestamp?.split("T")[0] || new Date().toISOString().split("T")[0];

      if (data.transactionType === "IN") {
        totalIn += data.quantity || 0;
      } else {
        totalOut += data.quantity || 0;
      }

      // Group by item
      if (!byItem[data.itemName]) {
        byItem[data.itemName] = { in: 0, out: 0 };
      }
      if (data.transactionType === "IN") {
        byItem[data.itemName].in += data.quantity || 0;
      } else {
        byItem[data.itemName].out += data.quantity || 0;
      }

      // Group by date
      if (!byDate[date]) {
        byDate[date] = { in: 0, out: 0 };
      }
      if (data.transactionType === "IN") {
        byDate[date].in += data.quantity || 0;
      } else {
        byDate[date].out += data.quantity || 0;
      }
    });

    res.json({
      totalStockIn: totalIn,
      totalStockOut: totalOut,
      byItem,
      byDate,
      transactionCount: snapshot.size,
    });
  } catch (error) {
    console.error("Error generating transaction summary:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get inventory stats
    const inventorySnapshot = await db.collection("inventory").get();
    const items = [];
    inventorySnapshot.forEach((doc) => {
      items.push(doc.data());
    });

    // Get transaction stats
    const transactionSnapshot = await db.collection("transactions").get();
    const transactions = [];
    transactionSnapshot.forEach((doc) => {
      transactions.push(doc.data());
    });

    const today = new Date().toISOString().split("T")[0];

    res.json({
      totalItems: items.length,
      totalStock: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      lowStockItems: items.filter((item) => (item.quantity || 0) < 10).length,
      totalTransactions: transactions.length,
      todayTransactions: transactions.filter(
        (t) => t.timestamp?.split("T")[0] === today
      ).length,
      stockInToday: transactions.filter(
        (t) =>
          t.transactionType === "IN" && t.timestamp?.split("T")[0] === today
      ).length,
      stockOutToday: transactions.filter(
        (t) =>
          t.transactionType === "OUT" && t.timestamp?.split("T")[0] === today
      ).length,
    });
  } catch (error) {
    console.error("Error generating dashboard stats:", error);
    res.status(500).json({ error: error.message });
  }
};
