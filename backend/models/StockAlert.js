const mongoose = require("mongoose");

const stockAlertSchema = new mongoose.Schema(
  {
    ingredient: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      default: "",
    },

    reportedBy: {
      type: String,
      default: "Kitchen",
    },

    status: {
      type: String,
      enum: ["OPEN", "RESOLVED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StockAlert", stockAlertSchema);
