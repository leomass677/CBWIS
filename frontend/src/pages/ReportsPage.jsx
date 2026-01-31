import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { db } from "@/utils/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";

// Import React Icons
import { FaNairaSign } from "react-icons/fa6";
import {
  FaFilePdf,
  FaFileExcel,
  FaChartBar,
  FaChartLine,
  FaChartPie,
  FaFilter,
  FaCalendarAlt,
  FaPrint,
  FaDownload,
  FaEye,
  FaEyeSlash,
  FaTimesCircle,
  FaBox,
  FaExchangeAlt,
  FaWarehouse,
  FaDollarSign,
  FaPercentage,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFileExport,
  FaFileAlt,
  FaClipboardList,
  FaHistory,
  FaBell,
  FaExclamationTriangle,
  FaArrowDown,
  FaArrowUp,
  FaUser,
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
);

const ReportsPage = () => {
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("inventory");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [summaryStats, setSummaryStats] = useState({
    totalValue: 0,
    avgPrice: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalItems: 0,
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  useEffect(() => {
    calculateSummaryStats();
  }, [inventory]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      console.log("Fetching report data...");

      // Fetch inventory
      const invSnap = await getDocs(collection(db, "inventory"));
      console.log("Inventory documents found:", invSnap.docs.length);

      const inventoryData = invSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Inventory data:", inventoryData);
      setInventory(inventoryData);

      // Fetch transactions with ordering
      const transSnap = await getDocs(
        query(collection(db, "transactions"), orderBy("timestamp", "desc")),
      );
      console.log("Transaction documents found:", transSnap.docs.length);

      const transactionsData = transSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error fetching report data:", error);
      alert("Error loading report data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaryStats = () => {
    if (inventory.length === 0) {
      setSummaryStats({
        totalValue: 0,
        avgPrice: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalItems: 0,
      });
      return;
    }

    const totalValue = inventory.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0,
    );

    const totalQuantity = inventory.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );

    const avgPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;

    const lowStockCount = inventory.filter(
      (item) => (item.quantity || 0) < 10 && (item.quantity || 0) > 0,
    ).length;

    const outOfStockCount = inventory.filter(
      (item) => (item.quantity || 0) === 0,
    ).length;

    setSummaryStats({
      totalValue,
      avgPrice,
      lowStockCount,
      outOfStockCount,
      totalItems: inventory.length,
    });
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;

    if (dateFrom || dateTo) {
      filtered = filtered.filter((t) => {
        const tDate = new Date(t.timestamp);
        if (dateFrom && tDate < new Date(dateFrom)) return false;
        if (dateTo && tDate > new Date(dateTo + "T23:59:59")) return false;
        return true;
      });
    }

    return filtered;
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF("landscape");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Add header
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text("CBWIS - Warehousing Report", pageWidth / 2, 17, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        pageWidth / 2,
        24,
        { align: "center" },
      );
      doc.text(
        `Report Type: ${
          reportType === "inventory" ? "Inventory Status" : "Transaction Report"
        }`,
        pageWidth / 2,
        28,
        { align: "center" },
      );

      doc.setTextColor(0, 0, 0);
      let yPosition = 40;

      if (reportType === "inventory") {
        // Inventory Summary
        doc.setFontSize(14);
        doc.text("Inventory Summary", 15, yPosition);
        yPosition += 10;

        const summaryData = [
          ["Total Items", inventory.length],
          [
            "Total Stock",
            inventory.reduce((sum, item) => sum + (item.quantity || 0), 0),
          ],
          [
            "Low Stock Items",
            inventory.filter(
              (item) => (item.quantity || 0) < 10 && (item.quantity || 0) > 0,
            ).length,
          ],
          [
            "Out of Stock",
            inventory.filter((item) => (item.quantity || 0) === 0).length,
          ],
          ["Total Value", `₦${summaryStats.totalValue.toFixed(2)}`],
          ["Average Price", `₦${summaryStats.avgPrice.toFixed(2)}`],
        ];

        autoTable(doc, {
          body: summaryData,
          startY: yPosition,
          theme: "grid",
          styles: { fontSize: 10 },
          columnStyles: { 0: { fontStyle: "bold" } },
        });
        yPosition = doc.lastAutoTable.finalY + 15;

        // Color Legend
        doc.setFontSize(12);
        doc.text("Color Legend", 15, yPosition);
        yPosition += 8;

        doc.setDrawColor(255, 0, 0);
        doc.setFillColor(255, 200, 200);
        doc.rect(15, yPosition, 10, 8, "F");
        doc.setTextColor(0, 0, 0);
        doc.text("Red: Out of Stock", 30, yPosition + 6);

        doc.setDrawColor(255, 193, 7);
        doc.setFillColor(255, 243, 205);
        doc.rect(100, yPosition, 10, 8, "F");
        doc.text("Yellow: Low Stock (less than 10)", 115, yPosition + 6);

        yPosition += 20;

        // Inventory Details
        doc.setFontSize(14);
        doc.text("Inventory Details", 15, yPosition);
        yPosition += 10;

        const inventoryData = inventory.map((item) => [
          item.itemName,
          item.category,
          item.supplier || "-",
          item.quantity || 0,
          `₦${item.unitPrice?.toFixed(2) || "0.00"}`,
          `₦${((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}`,
        ]);

        autoTable(doc, {
          head: [
            [
              "Item Name",
              "Category",
              "Supplier",
              "Quantity",
              "Unit Price (₦)",
              "Total Value (₦)",
            ],
          ],
          body: inventoryData,
          startY: yPosition,
          theme: "grid",
          styles: { fontSize: 9 },
        });
      } else {
        // Transaction Summary
        const filtered = getFilteredTransactions();
        doc.setFontSize(14);
        doc.text("Transaction Summary", 15, yPosition);
        yPosition += 10;

        const summaryData = [
          ["Total Transactions", filtered.length],
          [
            "Stock In",
            filtered.filter((t) => t.transactionType === "IN").length,
          ],
          [
            "Stock Out",
            filtered.filter((t) => t.transactionType === "OUT").length,
          ],
          ["Period", `${dateFrom || "Start"} to ${dateTo || "End"}`],
        ];

        autoTable(doc, {
          body: summaryData,
          startY: yPosition,
          theme: "grid",
          styles: { fontSize: 10 },
          columnStyles: { 0: { fontStyle: "bold" } },
        });
        yPosition = doc.lastAutoTable.finalY + 15;

        // Transaction Details
        doc.setFontSize(14);
        doc.text("Transaction Details", 15, yPosition);
        yPosition += 10;

        const transData = filtered.map((t) => [
          new Date(t.timestamp).toLocaleString(),
          t.itemName,
          t.transactionType === "IN" ? "Stock In" : "Stock Out",
          t.quantity,
          t.performedBy,
        ]);

        autoTable(doc, {
          head: [["Date & Time", "Item", "Type", "Quantity", "Performed By"]],
          body: transData,
          startY: yPosition,
          theme: "striped",
          styles: { fontSize: 8 },
        });
      }

      // Add footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10);
      }

      doc.save(`cbwis-report-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Error exporting PDF: " + error.message);
    }
  };

  const exportToExcel = () => {
    try {
      const wsData =
        reportType === "inventory"
          ? inventory.map((item) => ({
              "Item Name": item.itemName,
              Category: item.category,
              Supplier: item.supplier || "-",
              Quantity: item.quantity || 0,
              "Unit Price (₦)": item.unitPrice?.toFixed(2) || "0.00",
              "Total Value (₦)": (
                (item.quantity || 0) * (item.unitPrice || 0)
              ).toFixed(2),
              Status:
                (item.quantity || 0) === 0
                  ? "Out of Stock"
                  : (item.quantity || 0) < 10
                    ? "Low Stock"
                    : "Normal",
            }))
          : getFilteredTransactions().map((t) => ({
              "Date & Time": new Date(t.timestamp).toLocaleString(),
              Item: t.itemName,
              Type: t.transactionType === "IN" ? "Stock In" : "Stock Out",
              Quantity: t.quantity,
              "Performed By": t.performedBy,
              Category: t.category || "-",
            }));

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        wb,
        ws,
        reportType === "inventory" ? "Inventory Report" : "Transaction Report",
      );

      // Add summary sheet
      const summaryData =
        reportType === "inventory"
          ? [
              ["Inventory Summary", ""],
              ["Total Items", inventory.length],
              [
                "Total Stock",
                inventory.reduce((sum, item) => sum + (item.quantity || 0), 0),
              ],
              [
                "Low Stock Items",
                inventory.filter(
                  (item) =>
                    (item.quantity || 0) < 10 && (item.quantity || 0) > 0,
                ).length,
              ],
              [
                "Out of Stock",
                inventory.filter((item) => (item.quantity || 0) === 0).length,
              ],
              ["Total Value (₦)", summaryStats.totalValue.toFixed(2)],
              ["Average Price (₦)", summaryStats.avgPrice.toFixed(2)],
            ]
          : [
              ["Transaction Summary", ""],
              ["Total Transactions", getFilteredTransactions().length],
              [
                "Stock In",
                getFilteredTransactions().filter(
                  (t) => t.transactionType === "IN",
                ).length,
              ],
              [
                "Stock Out",
                getFilteredTransactions().filter(
                  (t) => t.transactionType === "OUT",
                ).length,
              ],
              ["Report Period", `${dateFrom || "Start"} to ${dateTo || "End"}`],
            ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

      XLSX.writeFile(
        wb,
        `cbwis-${reportType}-report-${
          new Date().toISOString().split("T")[0]
        }.xlsx`,
      );
    } catch (error) {
      console.error("Error exporting Excel:", error);
      alert("Error exporting Excel: " + error.message);
    }
  };

  const categoryStats = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + (item.quantity || 0);
    return acc;
  }, {});

  const transactionStats = {
    in: getFilteredTransactions().filter((t) => t.transactionType === "IN")
      .length,
    out: getFilteredTransactions().filter((t) => t.transactionType === "OUT")
      .length,
  };

  const transactionQuantityStats = {
    in: getFilteredTransactions()
      .filter((t) => t.transactionType === "IN")
      .reduce((sum, t) => sum + (t.quantity || 0), 0),
    out: getFilteredTransactions()
      .filter((t) => t.transactionType === "OUT")
      .reduce((sum, t) => sum + (t.quantity || 0), 0),
  };

  const getTopTransactions = () => {
    return getFilteredTransactions()
      .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
      .slice(0, 5);
  };

  // Format currency function
  const formatCurrency = (amount) => {
    return `₦${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
  };

  // Refresh data function
  const refreshData = () => {
    fetchReportData();
  };

  return (
    <div className="px-4 py-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex flex-col items-start justify-between mb-8 md:flex-row md:items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <FaChartBar className="mr-3 text-3xl text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reports & Analytics
            </h1>
            <p className="text-gray-600">
              Comprehensive insights and data analysis
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={refreshData}
            className="flex items-center px-4 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <FaDownload className="mr-2" />
            Refresh Data
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center px-4 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
          >
            <FaFilePdf className="mr-2" />
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 text-white transition bg-green-600 rounded-lg hover:bg-green-700"
          >
            <FaFileExcel className="mr-2" />
            Export Excel
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center px-4 py-2 text-white transition bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            <FaPrint className="mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Report Settings Card */}
      <div className="p-6 mb-6 bg-white shadow-md rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center text-xl font-bold text-gray-900">
            <FaFilter className="mr-2 text-blue-600" />
            Report Settings
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-1 text-blue-600 transition rounded-lg hover:text-blue-800 hover:bg-blue-50"
          >
            {showFilters ? (
              <FaEyeSlash className="mr-1" />
            ) : (
              <FaEye className="mr-1" />
            )}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {showFilters && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="flex items-center block mb-2 text-sm font-medium text-gray-700">
                  <FaFileAlt className="mr-2 text-gray-500" />
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="inventory">Inventory Status</option>
                  <option value="transactions">Transaction History</option>
                </select>
              </div>

              {reportType !== "inventory" && (
                <>
                  <div>
                    <label className="flex items-center block mb-2 text-sm font-medium text-gray-700">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      Date From
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center block mb-2 text-sm font-medium text-gray-700">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      Date To
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={() => {
                        setDateFrom("");
                        setDateTo("");
                      }}
                      className="flex items-center justify-center w-full px-4 py-2 text-gray-800 transition bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      <FaTimesCircle className="mr-2" />
                      Clear Dates
                    </button>
                  </div>
                </>
              )}

              {reportType === "inventory" && (
                <div>
                  <label className="flex items-center block mb-2 text-sm font-medium text-gray-700">
                    <FaBox className="mr-2 text-gray-500" />
                    Sort By
                  </label>
                  <select
                    className="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => handleSort(e.target.value)}
                  >
                    <option value="">Default</option>
                    <option value="quantity">Quantity</option>
                    <option value="itemName">Name</option>
                    <option value="unitPrice">Price</option>
                    <option value="category">Category</option>
                  </select>
                </div>
              )}
            </div>

            {/* Color Legend */}
            <div className="pt-4 border-t border-gray-200">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Color Legend:
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 bg-red-100 border border-red-300 rounded"></div>
                  <span className="text-sm text-gray-600">
                    Red: Out of Stock
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span className="text-sm text-gray-600">
                    Yellow: Low Stock (less than 10)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 border-4 border-blue-600 rounded-full animate-spin h-14 w-14 border-t-transparent"></div>
          <p className="text-lg text-gray-600">Loading report data...</p>
          <p className="text-sm text-gray-400">
            Please wait while we fetch your analytics
          </p>
        </div>
      ) : inventory.length === 0 && reportType === "inventory" ? (
        <div className="p-12 text-center bg-white shadow-md rounded-xl">
          <FaBox className="mx-auto mb-4 text-5xl text-gray-300" />
          <h3 className="mb-2 text-xl font-semibold text-gray-700">
            No Inventory Data Found
          </h3>
          <p className="mb-6 text-gray-500">
            There are no inventory items to display in the report.
          </p>
          <div className="text-sm text-gray-400">
            Total Items: <span className="font-bold">0</span> | Total Value:{" "}
            <span className="font-bold">₦0.00</span>
          </div>
        </div>
      ) : (
        <>
          {reportType === "inventory" ? (
            <>
              {/* Inventory Stats Cards */}
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 bg-white border border-blue-200 shadow-md rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="flex items-center text-sm font-medium text-gray-600">
                        <FaBox className="mr-2" />
                        Total Items
                      </p>
                      <p className="mt-2 text-2xl font-bold text-blue-600">
                        {summaryStats.totalItems}
                      </p>
                    </div>
                    <FaBox className="text-2xl text-blue-500" />
                  </div>
                </div>

                <div className="p-6 bg-white border border-green-200 shadow-md rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="flex items-center text-sm font-medium text-gray-600">
                        <FaNairaSign className="mr-2" />
                        Total Value
                      </p>
                      <p className="mt-2 text-2xl font-bold text-green-600">
                        {formatCurrency(summaryStats.totalValue)}
                      </p>
                    </div>
                    <FaNairaSign className="text-2xl text-green-500" />
                  </div>
                </div>

                <div className="p-6 bg-white border border-yellow-200 shadow-md rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="flex items-center text-sm font-medium text-gray-600">
                        <FaExclamationTriangle className="mr-2" />
                        Low Stock
                      </p>
                      <p className="mt-2 text-2xl font-bold text-yellow-600">
                        {summaryStats.lowStockCount}
                      </p>
                    </div>
                    <FaExclamationTriangle className="text-2xl text-yellow-500" />
                  </div>
                </div>

                <div className="p-6 bg-white border border-red-200 shadow-md rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="flex items-center text-sm font-medium text-gray-600">
                        <FaBell className="mr-2" />
                        Out of Stock
                      </p>
                      <p className="mt-2 text-2xl font-bold text-red-600">
                        {summaryStats.outOfStockCount}
                      </p>
                    </div>
                    <FaBell className="text-2xl text-red-500" />
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
                <div className="p-6 bg-white shadow-md rounded-xl">
                  <h2 className="flex items-center mb-4 text-xl font-bold text-gray-900">
                    <FaChartPie className="mr-2 text-blue-600" />
                    Stock Distribution by Category
                  </h2>
                  <Doughnut
                    data={{
                      labels: Object.keys(categoryStats),
                      datasets: [
                        {
                          data: Object.values(categoryStats),
                          backgroundColor: [
                            "#3b82f6",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                            "#8b5cf6",
                            "#ec4899",
                            "#14b8a6",
                          ],
                          borderWidth: 2,
                          borderColor: "#ffffff",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "right",
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                          },
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
                      cutout: "60%",
                    }}
                  />
                </div>

                <div className="p-6 bg-white shadow-md rounded-xl">
                  <h2 className="flex items-center mb-4 text-xl font-bold text-gray-900">
                    <FaChartBar className="mr-2 text-blue-600" />
                    Stock Value by Category (₦)
                  </h2>
                  <Bar
                    data={{
                      labels: Object.keys(categoryStats),
                      datasets: [
                        {
                          label: "Stock Value (₦)",
                          data: Object.keys(categoryStats).map((category) => {
                            return inventory
                              .filter((item) => item.category === category)
                              .reduce(
                                (sum, item) =>
                                  sum +
                                  (item.quantity || 0) * (item.unitPrice || 0),
                                0,
                              );
                          }),
                          backgroundColor: "rgba(59, 130, 246, 0.7)",
                          borderColor: "rgb(59, 130, 246)",
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function (value) {
                              return "₦" + value.toLocaleString();
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Inventory Table */}
              <div className="p-6 bg-white shadow-md rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="flex items-center text-xl font-bold text-gray-900">
                    <FaClipboardList className="mr-2 text-blue-600" />
                    Inventory Report
                  </h2>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaDownload className="mr-1" />
                    Showing {inventory.length} items | Total Value:{" "}
                    {formatCurrency(summaryStats.totalValue)}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                          <div
                            className="flex items-center transition cursor-pointer hover:text-blue-600"
                            onClick={() => handleSort("itemName")}
                          >
                            Item Name
                            {sortConfig.key === "itemName" && (
                              <FaSortAmountDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                          Category
                        </th>
                        <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                          <div
                            className="flex items-center transition cursor-pointer hover:text-blue-600"
                            onClick={() => handleSort("quantity")}
                          >
                            Quantity
                            {sortConfig.key === "quantity" && (
                              <FaSortAmountDown className="ml-1" />
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                          Unit Price (₦)
                        </th>
                        <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                          Total Value (₦)
                        </th>
                        <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSortedData(inventory).map((item) => (
                        <tr
                          key={item.id}
                          className="transition border-b hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium">
                            {item.itemName}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">{item.supplier || "-"}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  item.quantity === 0
                                    ? "bg-red-100 text-red-800"
                                    : item.quantity < 10
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                {item.quantity || 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {formatCurrency(item.unitPrice || 0)}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {formatCurrency(
                              (item.quantity || 0) * (item.unitPrice || 0),
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {item.quantity === 0 ? (
                              <span className="px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                                Out of Stock
                              </span>
                            ) : item.quantity < 10 ? (
                              <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                                Low Stock
                              </span>
                            ) : (
                              <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                In Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Transaction Stats */}
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
                <div className="p-6 bg-white border border-green-200 shadow-md rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="flex items-center text-sm font-medium text-gray-600">
                        <FaExchangeAlt className="mr-2" />
                        Total Transactions
                      </p>
                      <p className="mt-2 text-2xl font-bold text-green-600">
                        {getFilteredTransactions().length}
                      </p>
                    </div>
                    <FaExchangeAlt className="text-2xl text-green-500" />
                  </div>
                </div>

                <div className="p-6 bg-white border border-blue-200 shadow-md rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="flex items-center text-sm font-medium text-gray-600">
                        <FaArrowDown className="mr-2" />
                        Total Stock In
                      </p>
                      <p className="mt-2 text-2xl font-bold text-blue-600">
                        {transactionStats.in} ({transactionQuantityStats.in}{" "}
                        units)
                      </p>
                    </div>
                    <FaArrowDown className="text-2xl text-blue-500" />
                  </div>
                </div>

                <div className="p-6 bg-white border border-red-200 shadow-md rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="flex items-center text-sm font-medium text-gray-600">
                        <FaArrowUp className="mr-2" />
                        Total Stock Out
                      </p>
                      <p className="mt-2 text-2xl font-bold text-red-600">
                        {transactionStats.out} ({transactionQuantityStats.out}{" "}
                        units)
                      </p>
                    </div>
                    <FaArrowUp className="text-2xl text-red-500" />
                  </div>
                </div>
              </div>

              {/* Transaction Charts */}
              <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
                <div className="p-6 bg-white shadow-md rounded-xl">
                  <h2 className="flex items-center mb-4 text-xl font-bold text-gray-900">
                    <FaChartBar className="mr-2 text-blue-600" />
                    Transaction Volume
                  </h2>
                  <Bar
                    data={{
                      labels: ["Stock In", "Stock Out"],
                      datasets: [
                        {
                          label: "Number of Transactions",
                          data: [transactionStats.in, transactionStats.out],
                          backgroundColor: ["#10b981", "#ef4444"],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>

                <div className="p-6 bg-white shadow-md rounded-xl">
                  <h2 className="flex items-center mb-4 text-xl font-bold text-gray-900">
                    <FaChartPie className="mr-2 text-blue-600" />
                    Quantity Distribution
                  </h2>
                  <Pie
                    data={{
                      labels: ["Stock In", "Stock Out"],
                      datasets: [
                        {
                          data: [
                            transactionQuantityStats.in,
                            transactionQuantityStats.out,
                          ],
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
                              return `${context.label}: ${context.raw} units`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Top Transactions */}
              <div className="p-6 mb-8 bg-white shadow-md rounded-xl">
                <h2 className="flex items-center mb-4 text-xl font-bold text-gray-900">
                  <FaHistory className="mr-2 text-blue-600" />
                  Top Transactions by Quantity
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {getTopTransactions().length > 0 ? (
                    getTopTransactions().map((trans, index) => (
                      <div
                        key={trans.id}
                        className="p-4 transition border rounded-lg bg-gray-50 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
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
                            <span className="font-semibold">
                              Top {index + 1}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {trans.quantity} units
                          </span>
                        </div>
                        <p className="font-medium text-gray-900">
                          {trans.itemName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {trans.category || "No category"}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">
                          {new Date(trans.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-8 text-center text-gray-500">
                      <FaHistory className="mx-auto mb-3 text-3xl text-gray-300" />
                      <p>No transactions found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Table */}
              <div className="p-6 bg-white shadow-md rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="flex items-center text-xl font-bold text-gray-900">
                    <FaClipboardList className="mr-2 text-blue-600" />
                    Transaction Details
                  </h2>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaCalendarAlt className="mr-1" />
                    {dateFrom || "All Time"} to {dateTo || "Present"}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                          Item
                        </th>
                        <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                          Type
                        </th>
                        <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                          Performed By
                        </th>
                        <th className="px-6 py-3 text-sm font-semibold text-left text-gray-900">
                          Category
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredTransactions().length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            <FaExchangeAlt className="mx-auto mb-3 text-3xl text-gray-300" />
                            <p className="text-lg font-medium">
                              No transaction records found
                            </p>
                            <p className="text-sm">
                              Try adjusting your date filters or add some
                              transactions
                            </p>
                          </td>
                        </tr>
                      ) : (
                        getFilteredTransactions().map((trans) => (
                          <tr
                            key={trans.id}
                            className="transition border-b hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-center">
                                <FaCalendarAlt className="mr-2 text-gray-400" />
                                {new Date(trans.timestamp).toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-medium">
                              {trans.itemName}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${
                                  trans.transactionType === "IN"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {trans.transactionType === "IN" ? (
                                  <>
                                    <FaArrowDown className="mr-1" />
                                    Stock In
                                  </>
                                ) : (
                                  <>
                                    <FaArrowUp className="mr-1" />
                                    Stock Out
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4">
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
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex items-center">
                                <FaUser className="mr-2 text-gray-400" />
                                {trans.performedBy}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded">
                                {trans.category || "-"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage;
