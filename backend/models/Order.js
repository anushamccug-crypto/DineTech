const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    tableNumber: { type: String, default: "N/A" },
    items: [
      {
        dishId: { type: mongoose.Schema.Types.ObjectId, ref: "Dish", required: true },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    specialNote: { type: String, default: "" },
    
    // ⭐ UPDATED: Added PREPARING and READY for the Kitchen Workflow
    status: {
      type: String,
      enum: ["PLACED", "PREPARING", "READY", "SERVED", "CANCELLED"],
      default: "PLACED",
    },

    estimatedPrepTime: { type: Number, default: 0 },

    payment: {
      status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED"],
        default: "PENDING",
      },
      // ⭐ UPDATED: Added RAZORPAY to the allowed methods
      method: {
        type: String,
        enum: ["CASH", "QR", "RAZORPAY"],
        default: "CASH",
      },
      paidAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);