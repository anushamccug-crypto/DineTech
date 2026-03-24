const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// ✅ POST - Add Review
router.post("/", async (req, res) => {
  try {
    const { customerName, dishId, dishName, rating, comment } = req.body;

    const newReview = new Review({
      customerName,
      dishId,
      dishName,
      rating,
      comment,
    });

    await newReview.save();

    res.status(201).json({
      message: "Review submitted successfully",
      review: newReview,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit review" });
  }
});

// ✅ GET - Get All Reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { customerName, dishId, dishName, rating, comment } = req.body;

    const review = await Review.create({
      customerName,
      dishId,
      dishName,
      rating,
      comment,
    });

    // 🔥 Get all reviews for that dish
    const reviews = await Review.find({ dishId });

    const totalRatings = reviews.length;

    const averageRating =
      reviews.reduce((acc, item) => acc + item.rating, 0) /
      totalRatings;

    // ✅ Update Dish with YOUR field names
    await Dish.findByIdAndUpdate(dishId, {
      "ratings.averageRating": averageRating,
      "ratings.totalRatings": totalRatings,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;