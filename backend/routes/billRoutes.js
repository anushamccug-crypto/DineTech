const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");

// 🔥 CREATE BILL (Auto Increment BILL-0001 format)
router.post("/create", async (req, res) => {
  try {
    const { customerName, items, gstPercentage, paymentMethod } = req.body;

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid bill data" });
    }

    // 🔥 AUTO INCREMENT LOGIC
    const lastBill = await Bill.findOne().sort({ billSequence: -1 });

    let nextSequence = 1;

    if (lastBill && lastBill.billSequence) {
      nextSequence = lastBill.billSequence + 1;
    }

    const formattedBillNumber = `BILL-${String(nextSequence).padStart(4, "0")}`;

    // Calculate item subtotals
    const processedItems = items.map(item => ({
      ...item,
      subtotal: item.price * item.quantity
    }));

    // Subtotal
    const subtotalAmount = processedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    // GST
    const gstAmount = (subtotalAmount * gstPercentage) / 100;

    // Grand Total
    const grandTotal = subtotalAmount + gstAmount;

    const newBill = new Bill({
      billSequence: nextSequence,
      billNumber: formattedBillNumber,
      customerName,
      items: processedItems,
      subtotalAmount,
      gstAmount,
      gstPercentage,
      grandTotal,
      paymentMethod,
      paymentStatus: "Pending"
    });

    const savedBill = await newBill.save();

    res.status(201).json(savedBill);

  } catch (error) {
    res.status(500).json({ message: "Bill creation failed", error });
  }
});

// 🔐 CONFIRM PAYMENT (Pending → Paid)
router.put("/pay/:id", async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    bill.paymentStatus = "Paid";

    // Optional: update payment method if sent
    if (paymentMethod) {
      bill.paymentMethod = paymentMethod;
    }

    const updatedBill = await bill.save();

    res.json({
      message: "Payment successful",
      bill: updatedBill
    });

  } catch (error) {
    res.status(500).json({ message: "Payment update failed", error });
  }
});

// 📋 GET ALL BILLS
router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bills", error });
  }
});

module.exports = router;
