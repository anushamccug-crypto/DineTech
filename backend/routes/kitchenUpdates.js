const express = require("express");
const router = express.Router();
const StockAlert = require("../models/StockAlert"); // your existing model

// Kitchen sends update
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description required" });
    }

    const alert = new StockAlert({
      ingredient: name,
      message: description,
    });

    await alert.save();

    res.status(201).json({
      message: "Kitchen update sent to Admin",
      alert,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin fetch kitchen updates
router.get("/", async (req, res) => {
  try {
    const updates = await StockAlert.find().sort({ createdAt: -1 });
    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
