const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Utility function to calculate start date
const getStartDate = (range) => {
  const startDate = new Date();
  if (range === "week") startDate.setDate(startDate.getDate() - 7);
  else if (range === "month") startDate.setMonth(startDate.getMonth() - 1);
  else startDate.setDate(startDate.getDate() - 1); // today
  return startDate;
};

// Dummy ML / analytics functions (replace with real models later)
const getStockPrediction = async () => [
  { ingredient: "Tomato", predictedUsage: 20 },
  { ingredient: "Cheese", predictedUsage: 15 },
];

const getFrequentCustomers = (orders) => {
  const customerCount = {};
  orders.forEach((o) => {
    customerCount[o.customerName] = (customerCount[o.customerName] || 0) + 1;
  });
  return Object.entries(customerCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([customerName, orders]) => ({ customerName, orders }));
};

const getCustomerSegments = (orders) => [
  { segment: "Frequent", count: 10 },
  { segment: "Occasional", count: 5 },
];

const detectAnomalies = (orders) => [
  { type: "Sales Drop", message: "Sales dropped 50% yesterday" },
];

const getSalesTrend = (orders) => {
  const trend = {};
  orders.forEach((o) => {
    const date = o.createdAt.toISOString().split("T")[0];
    trend[date] = (trend[date] || 0) + o.totalAmount;
  });
  return Object.entries(trend).map(([date, totalAmount]) => ({ date, totalAmount }));
};

// GET /api/admin/admin-dashboard?range=week
router.get("/admin-dashboard", async (req, res) => {
  try {
    const range = req.query.range || "week";
    const startDate = getStartDate(range);

    // Fetch orders within the selected range
    const orders = await Order.find({ createdAt: { $gte: startDate } });

    // Total Income & Orders
    const totalIncome = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;

    // Top Dishes
    const dishCount = {};
    orders.forEach((o) =>
      o.items.forEach((item) => {
        dishCount[item.name] = (dishCount[item.name] || 0) + item.quantity;
      })
    );
    const topDishes = Object.entries(dishCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Sales Trend
    const salesTrend = getSalesTrend(orders);

    // Inventory Predictions (dummy for now)
    const stockPrediction = await getStockPrediction();

    // Customer Insights
    const frequentCustomers = getFrequentCustomers(orders);
    const customerSegments = getCustomerSegments(orders);

    // Anomaly Alerts
    const anomalies = detectAnomalies(orders);

    res.json({
      totalIncome,
      totalOrders,
      topDishes,
      salesTrend,
      stockPrediction,
      frequentCustomers,
      customerSegments,
      anomalies,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
