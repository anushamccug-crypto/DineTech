const express = require("express");
const router = express.Router();
const StockAlert = require("../models/StockAlert");

// ✅ Kitchen Reports Ingredient Missing
router.post("/", async (req, res) => {
  try {
    const { ingredient, message } = req.body;

    const alert = new StockAlert({
      ingredient,
      message,
    });

    await alert.save();

    res.status(201).json({
      message: "Stock alert sent to admin",
      alert,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Admin Fetch All Alerts
router.get("/", async (req, res) => {
  try {
    const alerts = await StockAlert.find().sort({ createdAt: -1 });
    res.json(alerts);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Admin Resolves Alert
router.put("/:id/resolve", async (req, res) => {
  try {
    const updated = await StockAlert.findByIdAndUpdate(
      req.params.id,
      { status: "RESOLVED" },
      { new: true }
    );

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
