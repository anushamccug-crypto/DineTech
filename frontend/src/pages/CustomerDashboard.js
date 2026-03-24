import React, { useEffect, useState, useRef } from "react";
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

      const rated = localStorage.getItem(`orderRated_${id}`);
      if (order.status === "SERVED" && !rated) {
        setShowRatingPopup(true);
      }

      const prepTime = order.estimatedPrepTime || 15;
      setEstimatedPrepTime(prepTime);
      
      if (!hasInitializedTimer.current && order.status !== "SERVED") {
        setRemainingTime(prepTime * 60);
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

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleRating = (dishName, value) => {
    setRatings((prev) => ({ ...prev, [dishName]: value }));
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

  if (!orderId) return <div style={{ textAlign: "center", padding: "100px" }}><h3>No Orders Found</h3></div>;

  const statusSteps = ["PLACED", "PREPARING", "READY", "SERVED"];
  const statusColors = { PLACED: "#ff6ec7", PREPARING: "#d16ba5", READY: "#b185db", SERVED: "#845ec2" };
  const progressWidth = ((statusSteps.indexOf(orderStatus) + 1) / statusSteps.length) * 100;

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", background: "linear-gradient(135deg, #a83aed 0%, #ec4899 100%)", fontFamily: "sans-serif" }}>
      <div style={{ background: "white", padding: "30px", borderRadius: "20px", maxWidth: "600px", margin: "0 auto", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
        
        <h2 style={{ color: "#4A235A", borderBottom: "2px solid #f0f0f0", paddingBottom: "10px" }}>Order Status</h2>
        <p style={{ color: "#777" }}>Order ID: #{orderId.slice(-6)}</p>

        {/* 🥘 NEW: ITEMS ORDERED SECTION */}
        <div style={{ margin: "20px 0", padding: "15px", backgroundColor: "#FDFCFE", borderRadius: "12px", border: "1px dashed #7D3C98" }}>
          <h4 style={{ margin: "0 0 10px 0", color: "#4A235A" }}>Items Ordered:</h4>
          {orderDetails?.items?.map((item, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span>{item.name} <span style={{ color: "#777" }}>x{item.quantity}</span></span>
              <span style={{ fontWeight: "bold" }}>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #eee", marginTop: "10px", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
            <span>Total Amount:</span>
            <span>₹{orderDetails?.totalAmount}</span>
          </div>
        </div>

        {orderStatus !== "SERVED" && (
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
             <p style={{ fontSize: "20px", fontWeight: "bold", color: "#ec4899" }}>⏱ {formatTime(remainingTime)}</p>
             <p style={{ fontSize: "12px", color: "#999" }}>Wait time is estimated</p>
          </div>
        )}

        <div style={{ height: "10px", background: "#eee", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ width: `${progressWidth}%`, height: "100%", background: statusColors[orderStatus], transition: "width 1s ease" }} />
        </div>
        <p style={{ textAlign: "center", marginTop: "10px", fontWeight: "bold", color: statusColors[orderStatus] }}>{orderStatus}</p>

        {orderStatus !== "SERVED" && (
          <button onClick={() => setShowGameModal(true)} style={{ width: "100%", marginTop: "20px", padding: "15px", borderRadius: "12px", border: "none", background: "#4A235A", color: "white", fontWeight: "bold", cursor: "pointer" }}>
            🎮 Play Games While You Wait
          </button>
        )}
      </div>

      {/* GAME MODAL & RATING POPUP (Same as before) */}
      {showGameModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ width: "90%", height: "80vh", background: "white", borderRadius: "20px", position: "relative" }}>
            <button onClick={() => setShowGameModal(false)} style={{ position: "absolute", top: "10px", right: "10px", background: "#E74C3C", color: "white", border: "none", padding: "5px 15px", borderRadius: "5px" }}>Close ✕</button>
            <GamesHub />
          </div>
        </div>
      )}

      {showRatingPopup && orderDetails && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "20px", textAlign: "center", width: "350px" }}>
            <h3>⭐ Rate Your Meal</h3>
            {orderDetails.items?.map((dish, i) => (
              <div key={i} style={{ margin: "10px 0" }}>
                <p>{dish.name}</p>
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} onClick={() => handleRating(dish.name, s)} onMouseEnter={() => setHoverRating(prev => ({ ...prev, [dish.name]: s }))} onMouseLeave={() => setHoverRating({})} style={{ cursor: "pointer", fontSize: "25px", color: (hoverRating[dish.name] || ratings[dish.name]) >= s ? "#FFC107" : "#CCC" }}>★</span>
                ))}
              </div>
            ))}
            <button onClick={submitRatings} style={{ marginTop: "20px", width: "100%", padding: "10px", borderRadius: "10px", border: "none", background: "#4A235A", color: "white" }}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;