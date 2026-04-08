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
    const { customerName, tableNumber, items, totalAmount, method, specialNote } = req.body;

    if (!customerName || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Logic: If it's Razorpay or QR, mark as Success. If Cash, leave as Pending.
    const isPaid = (method === "RAZORPAY" || method === "QR");

    // ❗ Check if table already active
if (tableNumber) {
  const existingOrder = await Order.findOne({
    tableNumber,
    status: { $ne: "SERVED" } // still active
  });

  if (existingOrder) {
    return res.status(400).json({
      message: `Table ${tableNumber} is already occupied`
    });
  }
}

    const newOrder = new Order({
      customerName,
      tableNumber: tableNumber || "N/A",
      items,
      totalAmount,
      specialNote: specialNote || "",
      estimatedPrepTime: 15, // Default 15 mins
      status: "PLACED",
      payment: {
        method: method || "CASH",
        status: isPaid ? "SUCCESS" : "PENDING",
        paidAt: isPaid ? new Date() : null,
      },
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: "Order confirmed!", order: savedOrder });

  } catch (error) {
    console.error("Save Error:", error.message);
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

router.get("/active-tables", async (req, res) => {
  try {
    const activeOrders = await Order.find({
      status: { $ne: "SERVED" } // NOT served yet
    });

    const bookedTables = activeOrders.map(o => o.tableNumber);

    res.json(bookedTables);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;