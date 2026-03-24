import React, { useEffect, useState } from "react";
import axios from "axios";
import GamesHub from "./GamesHub";

function CustomerDashboard() {
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState("PLACED");
  const [estimatedPrepTime, setEstimatedPrepTime] = useState(0);
  const [orderDetails, setOrderDetails] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showGameModal, setShowGameModal] = useState(false);

  // ⭐ RATING FEATURE START
// ⭐ RATING FEATURE START
const [showRatingPopup, setShowRatingPopup] = useState(false);
const [ratings, setRatings] = useState({});
const [hoverRating, setHoverRating] = useState({});
// ⭐ RATING FEATURE END
  // ⭐ RATING FEATURE END

  useEffect(() => {
    const id = localStorage.getItem("latestOrderId");
    if (id) {
      setOrderId(id);
      fetchOrder(id);
    }
  }, []);

  const fetchOrder = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${id}`);

      const order = res.data;

      setOrderDetails(order);
      setOrderStatus(order.status);

      // ⭐ RATING LOGIC FIX
      const rated = localStorage.getItem(`orderRated_${id}`);

      if (order.status === "SERVED" && !rated) {
        setShowRatingPopup(true);
      }

      setEstimatedPrepTime(order.estimatedPrepTime || 0);
      setRemainingTime((order.estimatedPrepTime || 0) * 60);
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
      setRemainingTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime]);

  if (!orderId) {
    return (
      <h3 style={{ textAlign: "center", marginTop: "50px" }}>
        No Active Orders Found
      </h3>
    );
  }

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
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

    const existingRatings =
      JSON.parse(localStorage.getItem("dishRatings")) || {};

    const updatedRatings = { ...existingRatings, ...ratings };

    localStorage.setItem("dishRatings", JSON.stringify(updatedRatings));

    // mark order rated
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

  const progressWidth =
    ((statusSteps.indexOf(orderStatus) + 1) / statusSteps.length) * 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "Segoe UI, sans-serif",
        background:
          "linear-gradient(135deg, #a83aed 0%, #a83aed 60%, #ec4899 100%)",
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
  <h3 style={{ marginBottom: "15px" }}>Order ID: {orderId}</h3>

  {orderDetails && (
    <div style={{ textAlign: "left", marginBottom: "10px" }}>
      <p style={{ margin: "5px 0" }}>
        <strong>Customer:</strong> {orderDetails.customerName}
      </p>
      <p style={{ margin: "5px 0" }}>
        <strong>Total:</strong> ₹ {orderDetails.totalAmount}
      </p>
    </div>
  )}

  {orderStatus !== "READY" && orderStatus !== "SERVED" && (
    <p style={{ marginTop: "15px" }}>
      ⏱ Estimated: {estimatedPrepTime || 15} mins | <strong>Remaining:</strong> {formatTime(remainingTime)}
    </p>
  )}

  {/* Progress Bar */}
  <div
    style={{
      marginTop: "20px",
      background: "#eee",
      height: "12px",
      borderRadius: "20px",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${progressWidth}%`,
        background: statusColors[orderStatus],
        height: "100%",
        transition: "width 0.5s ease",
      }}
    />
  </div>

  <h4 style={{ marginTop: "15px", color: statusColors[orderStatus] }}>
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
              borderRadius: "14px",
              border: "none",
              background:
                "linear-gradient(135deg, #a83aed 0%, #a83aed 60%, #ec4899 100%)",
              color: "white",
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
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: "1100px",
              borderRadius: "25px",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowGameModal(false)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                border: "none",
                background: "#ff6ec7",
                color: "white",
                padding: "8px 16px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Close ✕
            </button>

            <GamesHub />
          </div>
        </div>
      )}

      {/* ⭐ RATING POPUP */}

      {showRatingPopup && orderDetails && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "20px",
              width: "400px",
              textAlign: "center",
            }}
          >
            <h3>⭐ Rate Your Order</h3>

            {orderDetails.items?.map((dish, index) => (
              <div key={index} style={{ marginTop: "15px" }}>
                <p>{dish.name}</p>

                {[1, 2, 3, 4, 5].map((star) => (
  <span
    key={star}
    onClick={() => handleRating(dish.name, star)}
    onMouseEnter={() =>
      setHoverRating((prev) => ({ ...prev, [dish.name]: star }))
    }
    onMouseLeave={() =>
      setHoverRating((prev) => ({ ...prev, [dish.name]: 0 }))
    }
    style={{
      cursor: "pointer",
      fontSize: "28px",
      margin: "5px",
      transition: "0.2s",
      color:
        (hoverRating[dish.name] || ratings[dish.name]) >= star
          ? "#ffc107"
          : "#ccc",
    }}
  >
    ★
  </span>
))}
              </div>
            ))}

            <button
              onClick={submitRatings}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                border: "none",
                borderRadius: "10px",
                background: "#845ec2",
                color: "white",
                cursor: "pointer",
              }}
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;

