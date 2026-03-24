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
const adminRoutes = require("./routes/admin");

dotenv.config();

const app = express();
app.use(express.json());

// ⭐ UPDATED CORS: This will allow your local machine AND any Vercel deployment you have
const allowedOrigins = [
  "http://localhost:3000",
  "https://dine-tech-tau.vercel.app",
  /\.vercel\.app$/  // This regex allows ANY URL ending in .vercel.app from your account
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

/* ✅ Routes */
app.use("/api/auth", authRoutes);
app.use("/api/dishes", dishRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/admin/kitchen-updates", kitchenUpdatesRouter);
app.use("/api/admin", adminRoutes);

/* ✅ MongoDB Connection */
connectDB();

app.get("/", (req, res) => {
  res.send("DINE TECH Backend Running");
});

const PORT = process.env.PORT || 5000; // Use process.env.PORT for Vercel compatibility
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});