const express = require("express");
const router = express.Router();
const Inventory = require("../models/Inventory");

// ✅ GET ALL INVENTORY ITEMS
router.get("/", async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ ingredientName: 1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ ADD NEW INGREDIENT (Admin)
router.post("/", async (req, res) => {
  try {
    let { ingredientName, quantityAvailable, unit } = req.body;

    if (!ingredientName)
      return res.status(400).json({ message: "Ingredient name required" });

    ingredientName = ingredientName.trim();

    if (quantityAvailable < 0)
      return res.status(400).json({ message: "Quantity cannot be negative" });

    const existing = await Inventory.findOne({ ingredientName });

    if (existing) {
      return res.status(400).json({ message: "Ingredient already exists" });
    }

    const newItem = new Inventory({
      ingredientName,
      quantityAvailable,
      unit,
    });

    const saved = await newItem.save();

    res.status(201).json({
      message: "Ingredient added successfully",
      data: saved,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ UPDATE INGREDIENT STOCK BY ID
router.put("/:id", async (req, res) => {
  try {
    const { quantityAvailable } = req.body;

    if (quantityAvailable < 0)
      return res.status(400).json({ message: "Quantity cannot be negative" });

    const updated = await Inventory.findByIdAndUpdate(
      req.params.id,
      { quantityAvailable },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Ingredient not found" });

    res.json({
      message: "Stock updated successfully",
      data: updated,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
