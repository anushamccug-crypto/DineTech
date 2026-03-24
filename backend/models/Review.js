const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },

  dishId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dish",
    required: true,
  },

  dishName: {
    type: String,
    required: true,
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  comment: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
