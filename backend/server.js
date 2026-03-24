const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const dishRoutes = require("./routes/dishRoutes");
const orderRoutes = require("./routes/orderRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const billRoutes = require("./routes/billRoutes");
const kitchenUpdatesRouter = require("./routes/kitchenUpdates");

// ✅ NEW: Admin Dashboard Route
const adminRoutes = require("./routes/admin");

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:3000", "https://dine-tech-tau.vercel.app"], // ⭐ Paste your FRONTEND link here
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

/* ✅ Routes */
app.use("/api/auth", authRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/admin/kitchen-updates", kitchenUpdatesRouter);

// ✅ Admin Dashboard API
app.use("/api/admin", adminRoutes);

/* ✅ MongoDB Connection */
connectDB();

app.get("/", (req, res) => {
  res.send("DINE TECH Backend Running");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 