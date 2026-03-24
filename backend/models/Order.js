const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },

    items: [
      {
        dishId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: true,
        },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    specialNote: {
      type: String,
      default: "",
    },

    // ✅ ORDER STATUS ENUM
    status: {
      type: String,
      enum: ["PLACED", "PAID", "CANCELLED"],
      default: "PLACED",
    },

    estimatedPrepTime: {
      type: Number,
      default: 0,
    },

    // ✅ PAYMENT DETAILS
    payment: {
      status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED"],
        default: "PENDING",
      },

      method: {
        type: String,
        enum: ["CASH", "QR"],
        default: "CASH",
      },

      paidAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
