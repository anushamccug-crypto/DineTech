const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

/*
====================================================
ORDER CREATED ONLY AFTER PAYMENT SUCCESS
====================================================
*/

// Confirm Payment + Create Order
router.post("/confirm-payment", async (req, res) => {
  try {
    const { customerName, items, totalAmount, method, specialNote } = req.body;

    if (!customerName || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Intelligent Prep Time Calculation

    let estimatedPrepTime = 0;
    let totalQuantity = 0;

    items.forEach((item) => {
      totalQuantity += item.quantity;

      if (item.type === "non-veg") {
        estimatedPrepTime += 8 * item.quantity;
      } else {
        estimatedPrepTime += 5 * item.quantity;
      }
    });

    if (totalQuantity > 4) {
      estimatedPrepTime += 5;
    }

    if (estimatedPrepTime === 0) {
      estimatedPrepTime = 10;
    }

    const newOrder = new Order({
      customerName,
      items,
      totalAmount,
      specialNote,
      estimatedPrepTime,
      status: "PLACED",

      payment: {
        method: method || "CASH",
        status: "SUCCESS",
        paidAt: new Date(),
      },
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Payment successful, order confirmed!",
      order: savedOrder,
    });

  } catch (error) {
    console.error("Confirm Payment Error:", error);
    res.status(500).json({ message: error.message });
  }
});

/*
====================================================
GET TODAY'S KITCHEN ORDERS
====================================================
*/

router.get("/today", async (req, res) => {
  try {

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }
    }).sort({ createdAt: 1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
====================================================
GET ORDER HISTORY (OLDER ORDERS)
====================================================
*/

router.get("/history", async (req, res) => {
  try {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $lt: today }
    }).sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
====================================================
GET ALL ORDERS
====================================================
*/

router.get("/", async (req, res) => {
  try {

    const orders = await Order.find().sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
====================================================
GET SINGLE ORDER
====================================================
*/

router.get("/:id", async (req, res) => {
  try {

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
====================================================
UPDATE ORDER STATUS (KITCHEN CONTROL)
====================================================
*/

router.put("/:id/status", async (req, res) => {
  try {

    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
