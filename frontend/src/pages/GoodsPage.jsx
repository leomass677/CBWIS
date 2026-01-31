import React, { useState, useEffect } from "react";
import { db, auth } from "@/utils/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

// Import React Icons
import {
  FaExchangeAlt,
  FaHistory,
  FaCalendarDay,
  FaArrowDown,
  FaArrowUp,
  FaBox,
  FaWarehouse,
  FaCheckCircle,
  FaUser,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFilter,
  FaClock,
  FaChartLine,
} from "react-icons/fa";

// Helper to safely convert Firestore Timestamp to ISO date string
const getDateString = (timestamp) => {
  if (!timestamp) return "";
  if (typeof timestamp === "string") return timestamp;
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString().split("T")[0];
  }
  return "";
};

const GoodsPage = () => {
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [formData, setFormData] = useState({
    itemId: "",
    transactionType: "IN",
    quantity: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const invSnap = await getDocs(collection(db, "inventory"));
      setInventory(invSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      const transSnap = await getDocs(collection(db, "transactions"));
      setTransactions(
        transSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.itemId || formData.quantity <= 0) {
      alert("Please select an item and enter quantity");
      return;
    }

    try {
      const item = inventory.find((i) => i.id === formData.itemId);
      if (!item) {
        alert("Item not found");
        return;
      }

      // For stock out, check if enough quantity exists
      if (
        formData.transactionType === "OUT" &&
        (item.quantity || 0) < parseInt(formData.quantity)
      ) {
        alert(`Insufficient stock! Available: ${item.quantity || 0}`);
        return;
      }

      // Create transaction
      await addDoc(collection(db, "transactions"), {
        itemId: formData.itemId,
        itemName: item.itemName,
        category: item.category,
        transactionType: formData.transactionType,
        quantity: parseInt(formData.quantity),
        performedBy: auth.currentUser?.email || "unknown",
        timestamp: new Date().toISOString(),
      });

      // Update inventory quantity
      const newQuantity =
        formData.transactionType === "IN"
          ? (item.quantity || 0) + parseInt(formData.quantity)
          : Math.max(0, (item.quantity || 0) - parseInt(formData.quantity));

      await updateDoc(doc(db, "inventory", formData.itemId), {
        quantity: newQuantity,
      });

      setFormData({ itemId: "", transactionType: "IN", quantity: 0 });
      fetchData();
      alert(
        `${
          formData.transactionType === "IN" ? "Stock In" : "Stock Out"
        } recorded successfully`
      );
    } catch (error) {
      console.error("Error recording transaction:", error);
      alert("Error recording transaction");
    }
  };

  // Filter transactions
  const filteredTransactions = transactions
    .filter((trans) => {
      if (filterType === "IN") return trans.transactionType === "IN";
      if (filterType === "OUT") return trans.transactionType === "OUT";
      return true;
    })
    .filter((trans) => {
      if (!dateFilter) return true;
      return getDateString(trans.timestamp) === dateFilter;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Calculate totals
  const totalStockIn = transactions
    .filter((t) => t.transactionType === "IN")
    .reduce((sum, t) => sum + (t.quantity || 0), 0);

  const totalStockOut = transactions
    .filter((t) => t.transactionType === "OUT")
    .reduce((sum, t) => sum + (t.quantity || 0), 0);

  const todayStockIn = transactions
    .filter(
      (t) =>
        t.transactionType === "IN" &&
        getDateString(t.timestamp) === new Date().toISOString().split("T")[0]
    )
    .reduce((sum, t) => sum + (t.quantity || 0), 0);

  const todayStockOut = transactions
    .filter(
      (t) =>
        t.transactionType === "OUT" &&
        getDateString(t.timestamp) === new Date().toISOString().split("T")[0]
    )
    .reduce((sum, t) => sum + (t.quantity || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <FaExchangeAlt className="text-3xl text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold text-gray-900">Goods In/Out</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Transaction Form */}
        <div className="card lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FaBox className="mr-2 text-blue-600" />
            Record Transaction
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label flex items-center">
                  <FaWarehouse className="mr-2 text-gray-500" />
                  Item *
                </label>
                <select
                  value={formData.itemId}
                  onChange={(e) =>
                    setFormData({ ...formData, itemId: e.target.value })
                  }
                  className="form-input"
                  required
                >
                  <option value="">Select an item</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemName} (Stock: {item.quantity || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label flex items-center">
                  <FaExchangeAlt className="mr-2 text-gray-500" />
                  Transaction Type *
                </label>
                <select
                  value={formData.transactionType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transactionType: e.target.value,
                    })
                  }
                  className="form-input"
                >
                  <option value="IN">Stock In (Received)</option>
                  <option value="OUT">Stock Out (Issued)</option>
                </select>
              </div>

              <div>
                <label className="form-label flex items-center">
                  {formData.transactionType === "IN" ? (
                    <FaArrowDown className="mr-2 text-green-500" />
                  ) : (
                    <FaArrowUp className="mr-2 text-red-500" />
                  )}
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center ${
                    formData.transactionType === "IN"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {formData.transactionType === "IN" ? (
                    <>
                      <FaArrowDown className="mr-2" />
                      Record Stock In
                    </>
                  ) : (
                    <>
                      <FaArrowUp className="mr-2" />
                      Record Stock Out
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="card bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium flex items-center">
                  <FaChartLine className="mr-2" />
                  Total Stock In
                </p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {totalStockIn}
                </p>
              </div>
              <FaArrowDown className="text-2xl text-blue-500" />
            </div>
          </div>

          <div className="card bg-red-50 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium flex items-center">
                  <FaChartLine className="mr-2" />
                  Total Stock Out
                </p>
                <p className="text-2xl font-bold text-red-600 mt-2">
                  {totalStockOut}
                </p>
              </div>
              <FaArrowUp className="text-2xl text-red-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card bg-green-50 border border-green-200">
              <p className="text-gray-600 text-sm font-medium flex items-center">
                <FaCalendarDay className="mr-1" />
                Today's In
              </p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {todayStockIn}
              </p>
            </div>
            <div className="card bg-orange-50 border border-orange-200">
              <p className="text-gray-600 text-sm font-medium flex items-center">
                <FaCalendarDay className="mr-1" />
                Today's Out
              </p>
              <p className="text-xl font-bold text-orange-600 mt-1">
                {todayStockOut}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <FaHistory className="text-xl text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">
              Transaction History
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center">
              <FaFilter className="text-gray-500 mr-2" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="form-input text-sm"
              >
                <option value="ALL">All Transactions</option>
                <option value="IN">Stock In Only</option>
                <option value="OUT">Stock Out Only</option>
              </select>
            </div>
            <div className="flex items-center">
              <FaClock className="text-gray-500 mr-2" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="form-input text-sm"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    <div className="flex items-center">
                      <FaClock className="mr-2" />
                      Date & Time
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    <div className="flex items-center">
                      <FaBox className="mr-2" />
                      Item
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th className="px6 py-3 text-right text-sm font-semibold text-gray-900">
                    <div className="flex items-center justify-end">
                      <FaSortAmountUp className="mr-2" />
                      Quantity
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    <div className="flex items-center">
                      <FaUser className="mr-2" />
                      Performed By
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <FaHistory className="text-3xl text-gray-300 mx-auto mb-2" />
                      <p>No transactions found</p>
                      {filterType !== "ALL" || dateFilter ? (
                        <p className="text-sm mt-1">
                          Try changing your filters
                        </p>
                      ) : null}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.slice(0, 20).map((trans) => (
                    <tr key={trans.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center">
                          <FaClock className="mr-2 text-gray-400" />
                          {new Date(trans.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{trans.itemName}</p>
                          {trans.category && (
                            <p className="text-xs text-gray-500">
                              {trans.category}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center justify-center w-20 mx-auto ${
                            trans.transactionType === "IN"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {trans.transactionType === "IN" ? (
                            <>
                              <FaArrowDown className="mr-1" />
                              In
                            </>
                          ) : (
                            <>
                              <FaArrowUp className="mr-1" />
                              Out
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <span
                            className={`font-bold ${
                              trans.transactionType === "IN"
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {trans.transactionType === "IN" ? "+" : "-"}
                            {trans.quantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center">
                          <FaUser className="mr-2 text-gray-400" />
                          {trans.performedBy}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {filteredTransactions.length > 0 && (
          <div className="mt-4 pt-4 border-t text-sm text-gray-600 flex justify-between items-center">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-2" />
              Showing {Math.min(filteredTransactions.length, 20)} of{" "}
              {filteredTransactions.length} transactions
            </div>
            {filteredTransactions.length > 20 && (
              <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                View All
                <FaArrowDown className="ml-1" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoodsPage;
