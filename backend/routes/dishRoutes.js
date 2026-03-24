const express = require("express");
const router = express.Router();
const Dish = require("../models/Dish");

// ✅ GET all dishes
router.get("/", async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dishes" });
  }
});

// ✅ GET dishes by category
router.get("/category/:categoryName", async (req, res) => {
  try {
    const category = req.params.categoryName;

    const dishes = await Dish.find({ category: category });

    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch category dishes" });
  }
});

// ✅ Disable dishes by ingredient (optional feature)
router.put("/disable-by-ingredient", async (req, res) => {
  try {
    const { ingredient } = req.body;

    const updated = await Dish.updateMany(
      { ingredients: ingredient },
      {
        "availability.inStock": false,
        "availability.quantityAvailable": 0,
      }
    );

    res.json({
      message: `All dishes containing ${ingredient} disabled`,
      updated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ 🔥 Kitchen Stock Update (MAIN FEATURE)
router.put("/:id/stock", async (req, res) => {
  try {
    const { quantityAvailable } = req.body;

    const dish = await Dish.findById(req.params.id);

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    dish.availability.quantityAvailable = quantityAvailable;

    // Auto toggle inStock
    if (quantityAvailable <= 0) {
      dish.availability.inStock = false;
      dish.availability.quantityAvailable = 0;
    } else {
      dish.availability.inStock = true;
    }

    await dish.save();

    res.json({
      message: "Stock updated successfully",
      dish,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
