import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import inventoryRoutes from "./routes/inventory.js";
import transactionRoutes from "./routes/transactions.js";
import reportRoutes from "./routes/reports.js";
import usersRoutes from "./routes/users.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "CBWIS Backend is running" });
});

// Routes
app.use("/api/users", usersRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/transactions", transactionRoutes);
app.use("/reports", reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`✅ CBWIS Backend running on http://localhost:${PORT}`);
  console.log(`📦 Frontend URL: ${process.env.FRONTEND_URL}`);
});
