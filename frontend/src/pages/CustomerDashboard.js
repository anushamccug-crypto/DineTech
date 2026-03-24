import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import GamesHub from "./GamesHub";

// ✅ Dynamic URL: Works on your laptop AND on Vercel
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://dine-tech-iyqs.vercel.app";

function CustomerDashboard() {
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState("PLACED");
  const [estimatedPrepTime, setEstimatedPrepTime] = useState(0);
  const [orderDetails, setOrderDetails] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showGameModal, setShowGameModal] = useState(false);

  // ⭐ RATING FEATURE START
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [ratings, setRatings] = useState({});
  const [hoverRating, setHoverRating] = useState({});
  // ⭐ RATING FEATURE END

  // ✅ Timer Guard: Prevents the clock from resetting during API refreshes
  const hasInitializedTimer = useRef(false);

  useEffect(() => {
    const id = localStorage.getItem("latestOrderId");
    if (id) {
      setOrderId(id);
      fetchOrder(id);
    }
  }, []);

  const fetchOrder = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders/${id}`);
      const order = res.data;

      setOrderDetails(order);
      setOrderStatus(order.status);

      // ⭐ RATING LOGIC FIX
      const rated = localStorage.getItem(`orderRated_${id}`);
      if (order.status === "SERVED" && !rated) {
        setShowRatingPopup(true);
      }

      setEstimatedPrepTime(order.estimatedPrepTime || 0);
      
      // Initialize timer only once
      if (!hasInitializedTimer.current && order.status !== "SERVED") {
        setRemainingTime((order.estimatedPrepTime || 0) * 60);
        hasInitializedTimer.current = true;
      }
    } catch (error) {
      console.error("Order fetch error:", error);
    }
  };

  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(() => fetchOrder(orderId), 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    if (remainingTime <= 0) return;
    const timer = setInterval(() => {
      setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingTime]);

  if (!orderId) {
    return (
      <h3 style={{ textAlign: "center", marginTop: "50px", color: "#4A235A" }}>
        No Active Orders Found
      </h3>
    );
  }

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // ⭐ RATING HANDLERS
  const handleRating = (dishName, value) => {
    setRatings((prev) => ({
      ...prev,
      [dishName]: value,
    }));
  };

  const submitRatings = () => {
    if (Object.keys(ratings).length === 0) {
      alert("Please rate at least one dish ⭐");
      return;
    }
    const existingRatings = JSON.parse(localStorage.getItem("dishRatings")) || {};
    const updatedRatings = { ...existingRatings, ...ratings };
    localStorage.setItem("dishRatings", JSON.stringify(updatedRatings));
    localStorage.setItem(`orderRated_${orderId}`, "true");
    setShowRatingPopup(false);
  };

  const statusSteps = ["PLACED", "PREPARING", "READY", "SERVED"];
  const statusColors = {
    PLACED: "#ff6ec7",
    PREPARING: "#d16ba5",
    READY: "#b185db",
    SERVED: "#845ec2",
  };

  const progressWidth = ((statusSteps.indexOf(orderStatus) + 1) / statusSteps.length) * 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "Segoe UI, sans-serif",
        background: "linear-gradient(135deg, #a83aed 0%, #a83aed 60%, #ec4899 100%)",
        color: "#2b2b2b",
      }}
    >
      {/* ORDER CARD */}
      <div
        style={{
          background: "#ffffff",
          padding: "30px",
          borderRadius: "20px",
          maxWidth: "750px",
          margin: "0 auto 30px auto",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
        }}
      >
        <h3 style={{ marginBottom: "15px", color: "#4A235A" }}>Order ID: #{orderId.slice(-6)}</h3>

        {orderDetails && (
          <>
            <div style={{ textAlign: "left", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
              <p style={{ margin: "5px 0" }}><strong>Customer:</strong> {orderDetails.customerName}</p>
              <p style={{ margin: "5px 0" }}><strong>Payment Method:</strong> {orderDetails.payment?.method || "Not Available"}</p>
            </div>

            {/* 🥘 ITEMS ORDERED SECTION (Restored & Enhanced) */}
            <div style={{ background: "#f9f6fd", padding: "15px", borderRadius: "15px", marginBottom: "20px", border: "1px solid #eee" }}>
              <h4 style={{ marginTop: "0", color: "#4A235A" }}>Your Order:</h4>
              {orderDetails.items?.map((item, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span>{item.name} <strong style={{ color: "#7D3C98" }}>x{item.quantity}</strong></span>
                  <span style={{ fontWeight: "600" }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div style={{ borderTop: "2px solid #fff", marginTop: "10px", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.1em" }}>
                <span>Total Amount:</span>
                <span style={{ color: "#4A235A" }}>₹{orderDetails.totalAmount}</span>
              </div>
            </div>
          </>
        )}

        {orderStatus !== "READY" && orderStatus !== "SERVED" && (
          <p style={{ marginTop: "15px", fontSize: "18px" }}>
            ⏱ Estimated: {estimatedPrepTime} mins <br />
            <strong>Remaining:</strong> <span style={{ color: "#ec4899" }}>{formatTime(remainingTime)}</span>
          </p>
        )}

        {/* Progress Bar */}
        <div style={{ marginTop: "20px", background: "#eee", height: "12px", borderRadius: "20px", overflow: "hidden" }}>
          <div
            style={{
              width: `${progressWidth}%`,
              background: statusColors[orderStatus],
              height: "100%",
              transition: "width 0.8s ease-in-out",
            }}
          />
        </div>

        <h4 style={{ marginTop: "15px", color: statusColors[orderStatus], textTransform: "uppercase" }}>
          Status: {orderStatus}
        </h4>
      </div>

      {/* GAME BUTTON */}
      {orderStatus !== "SERVED" && (
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => setShowGameModal(true)}
            style={{
              padding: "15px 35px",
              borderRadius: "50px",
              border: "none",
              background: "white",
              color: "#a83aed",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
            }}
          >
            🎮 Play Games While You Wait
          </button>
        </div>
      )}

      {/* GAME MODAL */}
      {showGameModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(5px)" }}>
          <div style={{ width: "95%", maxWidth: "1100px", height: "85vh", background: "white", borderRadius: "25px", position: "relative", overflow: "hidden" }}>
            <button onClick={() => setShowGameModal(false)} style={{ position: "absolute", top: "15px", right: "15px", border: "none", background: "#ff6ec7", color: "white", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", zIndex: 1001 }}>Close ✕</button>
            <GamesHub />
          </div>
        </div>
      )}

      {/* ⭐ RATING POPUP */}
      {showRatingPopup && orderDetails && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "25px", width: "400px", textAlign: "center" }}>
            <h3 style={{ color: "#4A235A" }}>⭐ Rate Your Meal</h3>
            {orderDetails.items?.map((dish, index) => (
              <div key={index} style={{ marginTop: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                <p style={{ fontWeight: "600" }}>{dish.name}</p>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleRating(dish.name, star)}
                    onMouseEnter={() => setHoverRating((prev) => ({ ...prev, [dish.name]: star }))}
                    onMouseLeave={() => setHoverRating((prev) => ({ ...prev, [dish.name]: 0 }))}
                    style={{
                      cursor: "pointer",
                      fontSize: "30px",
                      margin: "0 5px",
                      color: (hoverRating[dish.name] || ratings[dish.name]) >= star ? "#ffc107" : "#ccc",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            ))}
            <button onClick={submitRatings} style={{ marginTop: "20px", padding: "12px 30px", border: "none", borderRadius: "12px", background: "linear-gradient(to right, #845ec2, #d16ba5)", color: "white", fontWeight: "bold", cursor: "pointer", width: "100%" }}>Submit Feedback</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;