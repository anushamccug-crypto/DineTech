import React, { useEffect, useState } from "react";
import axios from "axios";
import GamesHub from "./GamesHub";

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

  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [ratings, setRatings] = useState({});
  const [hoverRating, setHoverRating] = useState({});

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

      const rated = localStorage.getItem(`orderRated_${id}`);
      if (order.status === "SERVED" && !rated) {
        setShowRatingPopup(true);
      }

      setEstimatedPrepTime(order.estimatedPrepTime || 15);
      // Only reset timer if it's not already running
      if (remainingTime === 0) {
        setRemainingTime((order.estimatedPrepTime || 15) * 60);
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
      setRemainingTime((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingTime]);

  // ✅ Helper to get Tier Color
  const getTierStyle = (tier) => {
    switch (tier?.toUpperCase()) {
      case "GOLD": return { background: "#FFD700", color: "#000" };
      case "SILVER": return { background: "#C0C0C0", color: "#000" };
      case "BRONZE": return { background: "#CD7F32", color: "#fff" };
      default: return { background: "#845ec2", color: "#fff" };
    }
  };

  if (!orderId) {
    return (
      <h3 style={{ textAlign: "center", marginTop: "50px", fontFamily: "Segoe UI" }}>
        No Active Orders Found
      </h3>
    );
  }

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
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
    <div style={{
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "Segoe UI, sans-serif",
        background: "linear-gradient(135deg, #a83aed 0%, #a83aed 60%, #ec4899 100%)",
        color: "#2b2b2b",
      }}>
      
      <div style={{
          background: "#ffffff",
          padding: "30px",
          borderRadius: "20px",
          maxWidth: "750px",
          margin: "0 auto 30px auto",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
        }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>Order ID: {orderId.slice(-6)}</h3>
            {orderDetails && (
              <div style={{ textAlign: "left" }}>
                <p style={{ margin: "5px 0", fontSize: "18px" }}>
                  <strong>Welcome, {orderDetails.customerName}!</strong>
                </p>
                {/* ✅ Restoration of Tier Badge */}
                <span style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  ...getTierStyle(orderDetails.customerTier || "Member")
                }}>
                  {orderDetails.customerTier || "Standard Member"}
                </span>
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
             <p style={{ margin: "0", fontWeight: "bold", color: statusColors[orderStatus] }}>{orderStatus}</p>
          </div>
        </div>

        <hr style={{ margin: "20px 0", border: "0", borderTop: "1px solid #eee" }} />

        {orderDetails && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ margin: "5px 0" }}><strong>Total Amount:</strong> ₹ {orderDetails.totalAmount}</p>
            <p style={{ margin: "5px 0" }}><strong>Payment:</strong> {orderDetails.payment?.method || "Pending"}</p>
          </div>
        )}

        {orderStatus !== "READY" && orderStatus !== "SERVED" && (
          <p style={{ marginBottom: "10px" }}>
            ⏱ Estimated: {estimatedPrepTime} mins | <strong>Remaining:</strong> {formatTime(remainingTime)}
          </p>
        )}

        <div style={{ background: "#eee", height: "12px", borderRadius: "20px", overflow: "hidden" }}>
          <div style={{
              width: `${progressWidth}%`,
              background: statusColors[orderStatus],
              height: "100%",
              transition: "width 1s ease",
            }}
          />
        </div>
      </div>

      {orderStatus !== "SERVED" && (
        <div style={{ textAlign: "center" }}>
          <button onClick={() => setShowGameModal(true)} style={{
              padding: "15px 35px",
              borderRadius: "14px",
              border: "none",
              background: "#fff",
              color: "#a83aed",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
            }}>
            🎮 Play Games While You Wait
          </button>
        </div>
      )}

      {/* GAME MODAL */}
      {showGameModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div style={{ width: "95%", height: "90%", position: "relative", background: "#000", borderRadius: "20px" }}>
            <button onClick={() => setShowGameModal(false)} style={{ position: "absolute", top: "10px", right: "10px", zIndex: 1001, background: "red", color: "white", border: "none", padding: "10px", borderRadius: "50%", cursor: "pointer" }}>✕</button>
            <GamesHub />
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {showRatingPopup && orderDetails && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "20px", width: "350px", textAlign: "center" }}>
            <h3 style={{ color: "#4A235A" }}>How was your meal? ⭐</h3>
            {orderDetails.items?.map((dish, idx) => (
              <div key={idx} style={{ margin: "15px 0" }}>
                <p style={{ fontWeight: "500" }}>{dish.name}</p>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} 
                    onClick={() => setRatings({...ratings, [dish.name]: s})}
                    onMouseEnter={() => setHoverRating({...hoverRating, [dish.name]: s})}
                    onMouseLeave={() => setHoverRating({...hoverRating, [dish.name]: 0})}
                    style={{ cursor: "pointer", fontSize: "24px", color: (hoverRating[dish.name] || ratings[dish.name]) >= s ? "#FFD700" : "#ccc" }}>★</span>
                ))}
              </div>
            ))}
            <button onClick={submitRatings} style={{ width: "100%", padding: "12px", background: "#845ec2", color: "#white", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>Submit Feedback</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;