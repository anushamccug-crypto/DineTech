const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      default: "Your Restaurant Name"
    },

    // 🔥 Auto Increment Support
    billSequence: {
      type: Number,
      unique: true
    },

    billNumber: {
      type: String,
      unique: true
    },

    customerName: {
      type: String,
      required: true
    },

    items: [
      {
        dishId: String,
        name: String,
        price: Number,
        quantity: Number,
        subtotal: Number
      }
    ],

    subtotalAmount: Number,
    gstAmount: Number,
    gstPercentage: Number,
    grandTotal: Number,

    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Card"],
      default: "Cash"
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending"
    }

  },
  { timestamps: true } // automatically adds createdAt & updatedAt
);

module.exports = mongoose.model("Bill", billSchema);
