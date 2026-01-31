import React, { useState, useEffect } from "react";
import { db } from "@/utils/firebase";
import { motion } from "framer-motion";
import { collection, query, getDocs, where } from "firebase/firestore";
import StatCard from "@/components/StatCard";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Import React Icons
import {
  FaBox,
  FaExclamationTriangle,
  FaChartBar,
  FaArrowDown,
  FaArrowUp,
  FaFire,
  FaWarehouse,
  FaExchangeAlt,
  FaClock,
  FaCalendarAlt,
  FaShoppingCart,
  FaUser,
  FaBell,
  FaFilter,
  FaChartLine,
  FaTachometerAlt,
  FaPercentage,
  FaMoneyBillWave,
  FaDollarSign,
  FaRegChartBar,
  FaCubes,
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

// Helper to safely convert Firestore Timestamp to ISO date string
const getDateString = (timestamp) => {
  if (!timestamp) return "";
  if (typeof timestamp === "string") return timestamp;
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString().split("T")[0];
  }
  return "";
};

const DashboardPage = ({ user, role }) => {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalTransactions: 0,
    stockInCount: 0,
    stockOutCount: 0,
    totalStockValue: 0,
    todayTransactions: 0,
    outOfStockItems: 0,
    stockMovement: 0,
  });
  const [lowStockList, setLowStockList] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topItems, setTopItems] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch inventory stats
        const inventorySnap = await getDocs(collection(db, "inventory"));
        const items = inventorySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Calculate stock value
        const totalStockValue = items.reduce((sum, item) => {
          const quantity = item.quantity || 0;
          const price = item.unitPrice || 0;
          return sum + quantity * price;
        }, 0);

        const lowStockItems = items.filter((item) => (item.quantity || 0) < 20);
        const outOfStockItems = items.filter(
          (item) => (item.quantity || 0) === 0,
        );
        const lowStock = lowStockItems.length;

        // Sort low stock items by quantity (critical first)
        lowStockItems.sort((a, b) => (a.quantity || 0) - (b.quantity || 0));

        // Fetch transactions
        const transactionsSnap = await getDocs(collection(db, "transactions"));
        const transactions = transactionsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Get today's date
        const today = new Date().toISOString().split("T")[0];
        const todayTransactions = transactions.filter(
          (t) => getDateString(t.timestamp) === today,
        ).length;

        const stockIn = transactions.filter(
          (t) => t.transactionType === "IN",
        ).length;

        const stockOut = transactions.filter(
          (t) => t.transactionType === "OUT",
        ).length;

        // Calculate stock movement (in - out)
        const stockMovement = stockIn - stockOut;

        // Get recent transactions (last 5)
        const recent = [...transactions]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 5);

        // Get top items by quantity
        const top = [...items]
          .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
          .slice(0, 5);

        setStats({
          totalItems: items.length,
          lowStockItems: lowStock,
          totalTransactions: transactions.length,
          stockInCount: stockIn,
          stockOutCount: stockOut,
          totalStockValue: totalStockValue,
          todayTransactions: todayTransactions,
          outOfStockItems: outOfStockItems.length,
          stockMovement: stockMovement,
        });

        setLowStockList(lowStockItems);
        setRecentTransactions(recent);
        setTopItems(top);

        // Prepare chart data based on time range
        const days =
          timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 14;
        const lastDays = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          lastDays.push(date.toISOString().split("T")[0]);
        }

        const inCounts = lastDays.map(
          (date) =>
            transactions.filter(
              (t) =>
                t.transactionType === "IN" &&
                getDateString(t.timestamp) === date,
            ).length,
        );

        const outCounts = lastDays.map(
          (date) =>
            transactions.filter(
              (t) =>
                t.transactionType === "OUT" &&
                getDateString(t.timestamp) === date,
            ).length,
        );

        // Calculate total quantities
        const totalIn = transactions
          .filter((t) => t.transactionType === "IN")
          .reduce((sum, t) => sum + (t.quantity || 0), 0);

        const totalOut = transactions
          .filter((t) => t.transactionType === "OUT")
          .reduce((sum, t) => sum + (t.quantity || 0), 0);

        setChartData({
          labels: lastDays,
          inCounts,
          outCounts,
          totalIn,
          totalOut,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  const loaderVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50"
      >
        <motion.div
          variants={loaderVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: {
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            className="w-16 h-16 mx-auto mb-6 border-4 border-blue-600 rounded-full border-t-transparent"
          />

          <motion.p
            variants={itemVariants}
            className="text-lg font-medium text-gray-600"
          >
            Loading dashboard...
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="mt-2 text-sm text-gray-400"
          >
            Fetching your inventory data
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="px-4 py-6 mx-auto max-w-7xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-start justify-between mb-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center mb-2">
              <FaTachometerAlt className="mr-3 text-3xl text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <p className="flex items-center text-gray-600">
              <FaUser className="mr-2" />
              Welcome back,{" "}
              <span className="ml-1 font-semibold">{user?.email}</span>
            </p>
          </div>

          <div className="flex items-center mt-4 space-x-4 md:mt-0">
            <div className="flex items-center px-4 py-2 bg-white border rounded-lg shadow-sm">
              <FaCalendarAlt className="mr-2 text-gray-500" />
              <span className="mr-2 text-gray-700">Time Range:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="font-medium text-blue-600 bg-transparent border-none focus:ring-0"
              >
                <option value="7days">Last 7 Days</option>
                <option value="14days">Last 14 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>

            <div className="flex items-center px-4 py-2 text-blue-800 bg-blue-100 rounded-lg">
              <FaClock className="mr-2" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5"
        variants={{ container: { staggerChildren: 0.1 } }}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            title="Total Items"
            value={stats.totalItems}
            subtitle="In inventory"
            icon={<FaBox className="text-2xl text-blue-600" />}
            color="blue"
            trend={stats.totalItems > 0 ? "positive" : "neutral"}
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Low Stock"
            value={stats.lowStockItems}
            subtitle="Items < 20"
            icon={
              <FaExclamationTriangle className="text-2xl text-yellow-600" />
            }
            color="yellow"
            trend={stats.lowStockItems > 0 ? "warning" : "positive"}
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <StatCard
            title="Stock Value"
            value={`₦${stats.totalStockValue.toLocaleString()}`}
            subtitle="Total inventory value"
            icon={<FaMoneyBillWave className="text-2xl text-green-600" />}
            color="green"
            trend="positive"
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <StatCard
            title="Today's Transactions"
            value={stats.todayTransactions}
            subtitle="Activities today"
            icon={<FaShoppingCart className="text-2xl text-purple-600" />}
            color="purple"
            trend="neutral"
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <StatCard
            title="Stock Movement"
            value={stats.stockMovement}
            subtitle="Net change"
            icon={<FaExchangeAlt className="text-2xl text-indigo-600" />}
            color={stats.stockMovement >= 0 ? "indigo" : "red"}
            trend={stats.stockMovement >= 0 ? "positive" : "negative"}
          />
        </motion.div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
        {/* Left Column - Charts */}
        <div className="space-y-6 lg:col-span-2">
          {/* Stock Trend Chart */}
          <motion.div
            className="card"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="flex items-center text-xl font-bold text-gray-900">
                  <FaChartLine className="mr-2 text-blue-600" />
                  Stock Movement Trend
                </h2>
                <p className="text-sm text-gray-600">
                  Last{" "}
                  {timeRange === "7days"
                    ? "7"
                    : timeRange === "30days"
                      ? "30"
                      : "14"}{" "}
                  days
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Stock In</span>
                </div>
                <div className="flex items-center ml-4">
                  <div className="w-3 h-3 mr-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Stock Out</span>
                </div>
              </div>
            </div>

            {chartData && (
              <Line
                data={{
                  labels: chartData.labels.map((date) => {
                    const d = new Date(date);
                    return d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }),
                  datasets: [
                    {
                      label: "Stock In",
                      data: chartData.inCounts,
                      borderColor: "#10b981",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      borderWidth: 2,
                      tension: 0.4,
                      fill: true,
                    },
                    {
                      label: "Stock Out",
                      data: chartData.outCounts,
                      borderColor: "#ef4444",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      borderWidth: 2,
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      mode: "index",
                      intersect: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        drawBorder: false,
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }}
                height={120}
              />
            )}
          </motion.div>

          {/* Transaction Summary */}
          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="card">
              <h3 className="flex items-center mb-4 text-lg font-bold text-gray-900">
                <FaRegChartBar className="mr-2 text-blue-600" />
                Transaction Summary
              </h3>
              {chartData && (
                <Doughnut
                  data={{
                    labels: ["Stock In", "Stock Out"],
                    datasets: [
                      {
                        data: [chartData.totalIn, chartData.totalOut],
                        backgroundColor: ["#10b981", "#ef4444"],
                        borderWidth: 2,
                        borderColor: "#ffffff",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            const label = context.label || "";
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce(
                              (a, b) => a + b,
                              0,
                            );
                            const percentage = Math.round(
                              (value / total) * 100,
                            );
                            return `${label}: ${value} units (${percentage}%)`;
                          },
                        },
                      },
                    },
                    cutout: "70%",
                  }}
                />
              )}
            </div>

            <div className="card">
              <h3 className="flex items-center mb-4 text-lg font-bold text-gray-900">
                <FaCubes className="mr-2 text-blue-600" />
                Top Stock Items
              </h3>
              <div className="space-y-4">
                {topItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 mr-3 text-blue-600 bg-blue-100 rounded-lg">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.itemName}
                        </p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {item.quantity || 0} units
                      </p>
                      {item.unitPrice && (
                        <p className="text-sm text-gray-600">
                          ₦{item.unitPrice.toFixed(2)}/unit
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Alerts & Activity */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          {lowStockList.length > 0 && (
            <motion.div
              className="border-2 border-yellow-300 card bg-gradient-to-r from-yellow-50 to-orange-50"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="p-2 mr-3 bg-yellow-100 rounded-lg">
                    <FaExclamationTriangle className="text-xl text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-yellow-800">
                      Stock Alerts
                    </h2>
                    <p className="text-sm text-yellow-700">
                      Requires attention
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 text-sm font-semibold text-yellow-900 bg-yellow-200 rounded-full">
                  {lowStockList.length} items
                </span>
              </div>

              <div className="pr-2 space-y-3 overflow-y-auto max-h-80">
                {lowStockList.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                      item.quantity < 5
                        ? "bg-gradient-to-r from-red-50 to-pink-50 border-red-300"
                        : "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {item.quantity < 5 ? (
                            <>
                              <div className="p-1 mr-2 bg-red-100 rounded">
                                <FaFire className="text-red-500" />
                              </div>
                              <span className="text-sm font-semibold text-red-700">
                                CRITICAL
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="p-1 mr-2 bg-yellow-100 rounded">
                                <FaExclamationTriangle className="text-yellow-500" />
                              </div>
                              <span className="text-sm font-semibold text-yellow-700">
                                LOW STOCK
                              </span>
                            </>
                          )}
                        </div>
                        <p className="font-bold text-gray-900">
                          {item.itemName}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-600">
                            {item.category}
                          </p>
                          {item.supplier && (
                            <p className="text-xs text-gray-500">
                              Supplier: {item.supplier}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <span
                          className={`text-2xl font-bold ${
                            item.quantity < 5
                              ? "text-red-700"
                              : "text-yellow-700"
                          }`}
                        >
                          {item.quantity}
                        </span>
                        <p className="mt-1 text-xs text-gray-500">units</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex justify-between mb-1 text-xs text-gray-600">
                        <span>Stock Level</span>
                        <span>{item.quantity} / 20</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            item.quantity < 5
                              ? "bg-red-500"
                              : item.quantity < 20
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (item.quantity / 20) * 100,
                              100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            className="card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="flex items-center mb-4 text-lg font-bold text-gray-900">
              <FaClock className="mr-2 text-blue-600" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((trans) => (
                  <div
                    key={trans.id}
                    className="flex items-start p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div
                      className={`p-2 rounded-lg mr-3 ${
                        trans.transactionType === "IN"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {trans.transactionType === "IN" ? (
                        <FaArrowDown />
                      ) : (
                        <FaArrowUp />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {trans.itemName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {trans.transactionType === "IN"
                          ? "Stock In"
                          : "Stock Out"}{" "}
                        - {trans.quantity} units
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(trans.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-semibold ${
                          trans.transactionType === "IN"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {trans.transactionType === "IN" ? "+" : "-"}
                        {trans.quantity}
                      </span>
                      <p className="mt-1 text-xs text-gray-500">
                        {trans.performedBy?.split("@")[0]}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <FaClock className="mx-auto mb-3 text-3xl text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="card bg-gradient-to-r from-blue-50 to-indigo-50"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="flex items-center mb-4 text-lg font-bold text-gray-900">
              <FaChartBar className="mr-2 text-blue-600" />
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <FaWarehouse className="mr-2 text-blue-500" />
                  <span className="text-sm text-gray-600">Total Items</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalItems}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <FaExchangeAlt className="mr-2 text-green-500" />
                  <span className="text-sm text-gray-600">Transactions</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalTransactions}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <FaPercentage className="mr-2 text-yellow-500" />
                  <span className="text-sm text-gray-600">Low Stock %</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalItems > 0
                    ? Math.round((stats.lowStockItems / stats.totalItems) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <FaDollarSign className="mr-2 text-purple-500" />
                  <span className="text-sm text-gray-600">Avg. Value</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ₦
                  {stats.totalItems > 0
                    ? Math.round(
                        stats.totalStockValue / stats.totalItems,
                      ).toLocaleString()
                    : "0"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Summary */}
      <motion.div
        className="border border-gray-200 card bg-gradient-to-r from-gray-50 to-blue-50"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="p-3 mr-4 bg-blue-100 rounded-lg">
              <FaBell className="text-xl text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">System Status</h4>
              <p className="text-gray-600">
                {lowStockList.length > 0
                  ? `${lowStockList.length} items need attention`
                  : "All systems operational"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-semibold text-gray-900">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center px-4 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <FaChartBar className="mr-2" />
              Refresh Data
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
