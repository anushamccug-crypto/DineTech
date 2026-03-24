const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    ingredientName: {
      type: String,
      required: true,
      unique: true,
      trim: true, // ✅ Prevents extra space issues
    },

    quantityAvailable: {
      type: Number,
      required: true,
      default: 0,
    },

    unit: {
      type: String,
      default: "kg",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inventory", inventorySchema);
