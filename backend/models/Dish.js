const mongoose = require("mongoose");

const DishSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  isVeg: Boolean,
  cuisine: String,
  ingredients: [String],

  // ✅ Allergen field (ONLY ONCE)
  allergens: {
    type: [String],
    default: [],
  },

  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },

  availability: {
    inStock: Boolean,
    quantityAvailable: Number,
  },

  preparationTime: Number,

  ratings: {
    averageRating: Number,
    totalRatings: Number,
  },

  popularityScore: Number,
  imageUrl: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Dish", DishSchema);
