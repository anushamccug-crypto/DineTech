import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GamesHub from "./GamesHub";

// ✅ Dynamic URL: Works on both Localhost and Vercel
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
  const navigate = useNavigate();

  // ✅ Timer Guard: Prevents clock reset during API refreshes
  const hasInitializedTimer = useRef(false);

  // ⭐ REWARD SYSTEM STATES
  const [totalPoints, setTotalPoints] = useState(0);
  const [showRewardModal, setShowRewardModal] = useState(false);

  // ⭐ RATING FEATURE STATES
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
      // ✅ Using Dynamic API_BASE_URL
      const res = await axios.get(`${API_BASE_URL}/api/orders/${id}`);
      const order = res.data;
      setOrderDetails(order);
      setOrderStatus(order.status);

      const rated = localStorage.getItem(`orderRated_${id}`);
      if (order.status === "SERVED" && !rated) {
        setShowRatingPopup(true);
      }
     
      setEstimatedPrepTime(order.estimatedPrepTime || 0);
     
      // ✅ Initialize timer only once so it doesn't jump back every 5 seconds
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

  // ⭐ HANDLE GAME SCORES
  const handleGameOver = (pointsGained) => {
    const newTotal = totalPoints + pointsGained;
    setTotalPoints(newTotal);

    if (newTotal >= 500) {
      setShowRewardModal(true);
      setShowGameModal(false);
    } else if (pointsGained > 0) {
      alert(`🎉 You earned ${pointsGained} points! Current Total: ${newTotal}/500`);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const submitRatings = () => {
    if (Object.keys(ratings).length === 0) {
      alert("Please rate at least one dish ⭐");
      return;
    }
    localStorage.setItem(`orderRated_${orderId}`, "true");
    setShowRatingPopup(false);
    alert("Thank you for your feedback!");
    navigate("/menu");
  };

  const statusSteps = ["PLACED", "PREPARING", "READY", "SERVED"];
  const statusColors = {
    PLACED: "#5D534A",
    PREPARING: "#D4A373",
    READY: "#2D6A4F",
    SERVED: "#1B4332"
  };
  const progressWidth = ((statusSteps.indexOf(orderStatus) + 1) / statusSteps.length) * 100;

  if (!orderId) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FDF8F2", fontFamily: "serif", color: "#5D534A" }}>
      <h3 style={{ fontStyle: "italic" }}>No Active Orders Found</h3>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#FDF8F2", color: "#5D534A", position: "relative", overflowX: "hidden" }}>
     
      {/* BACKGROUND DECORATION */}
      <div style={{ position: "fixed", top: "-10%", left: "-5%", width: "70%", height: "50%", background: "#E6F3EF", borderRadius: "50%", filter: "blur(120px)", opacity: 0.6, zIndex: 0 }}></div>
      <div style={{ position: "fixed", bottom: "-10%", right: "-5%", width: "60%", height: "50%", background: "#FFF0F0", borderRadius: "50%", filter: "blur(120px)", opacity: 0.6, zIndex: 0 }}></div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "600px", margin: "0 auto" }}>
       
        {/* POINTS PROGRESS DISPLAY */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ display: "inline-block", background: "#5D534A", color: "white", padding: "8px 20px", borderRadius: "50px", fontSize: "12px", fontWeight: "800", letterSpacing: "1px", textTransform: "uppercase" }}>
            Reward Progress: <span style={{ color: "#D4A373" }}>{totalPoints}</span> / 500 pts
          </div>
        </div>

        {/* ORDER CARD */}
        <div style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(20px)", padding: "40px", borderRadius: "40px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)", border: "3px solid #5D534A", marginBottom: "30px" }}>
          <div style={{ textAlign: "center", borderBottom: "1px solid #FAF7F2", paddingBottom: "20px", marginBottom: "20px" }}>
            <h3 style={{ margin: 0, fontFamily: "serif", fontStyle: "italic", fontSize: "28px" }}>Live Order Status</h3>
            <p style={{ margin: "5px 0 0 0", fontSize: "10px", fontWeight: "900", color: "#D4A373", letterSpacing: "2px" }}>ID: {orderId.toUpperCase()}</p>
          </div>

          {orderDetails && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "9px", fontWeight: "900", textTransform: "uppercase", color: "#AAA" }}>Customer</p>
                <p style={{ margin: 0, fontWeight: "700" }}>{orderDetails.customerName}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "9px", fontWeight: "900", textTransform: "uppercase", color: "#AAA" }}>Amount</p>
                <p style={{ margin: 0, fontWeight: "700", color: "#D4A373" }}>₹ {orderDetails.totalAmount}</p>
              </div>
            </div>
          )}

          {orderStatus !== "READY" && orderStatus !== "SERVED" && (
            <div style={{ background: "#5D534A", padding: "20px", borderRadius: "25px", textAlign: "center", marginBottom: "20px" }}>
              <p style={{ margin: 0, fontSize: "10px", fontWeight: "900", color: "#D4A373", textTransform: "uppercase", letterSpacing: "2px" }}>Remaining Time</p>
              <h1 style={{ margin: 0, color: "white", fontFamily: "serif", fontStyle: "italic", fontSize: "40px" }}>{formatTime(remainingTime)}</h1>
            </div>
          )}

          <div style={{ marginTop: "20px", background: "#F1E9E0", height: "8px", borderRadius: "20px", overflow: "hidden" }}>
            <div style={{ width: `${progressWidth}%`, background: statusColors[orderStatus], height: "100%", transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }} />
          </div>
         
          <h4 style={{ marginTop: "20px", textAlign: "center", textTransform: "uppercase", letterSpacing: "3px", fontSize: "12px", fontWeight: "900", color: statusColors[orderStatus] }}>
            Current Stage: {orderStatus}
          </h4>
        </div>

        {orderStatus !== "SERVED" && (
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => setShowGameModal(true)}
              style={{ width: "100%", padding: "20px", borderRadius: "25px", border: "3px solid #5D534A", background: "white", color: "#5D534A", fontSize: "14px", fontWeight: "900", cursor: "pointer", textTransform: "uppercase", letterSpacing: "1px", boxShadow: "0 10px 20px rgba(0,0,0,0.05)", transition: "all 0.3s" }}
            >
              🎮 Wait while playing games
            </button>
          </div>
        )}
      </div>

      {/* GAME MODAL */}
      {showGameModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(93, 83, 74, 0.9)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: "500px", position: "relative" }}>
            <button onClick={() => setShowGameModal(false)} style={{ position: "absolute", top: "-50px", right: "0", background: "white", color: "#5D534A", border: "none", padding: "10px 20px", borderRadius: "15px", cursor: "pointer", fontWeight: "900", fontSize: "12px" }}>CLOSE ✕</button>
            <div style={{ background: "white", borderRadius: "40px", overflow: "hidden", border: "4px solid #D4A373", boxShadow: "0 30px 60px rgba(0,0,0,0.3)" }}>
              <GamesHub onGameOver={handleGameOver} />
            </div>
          </div>
        </div>
      )}

      {/* ⭐ REWARD MODAL */}
      {showRewardModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(93, 83, 74, 0.95)", backdropFilter: "blur(15px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div style={{ background: "white", padding: "50px", borderRadius: "50px", textAlign: "center", maxWidth: "400px", border: "5px dashed #D4A373", position: "relative" }}>
            <h1 style={{ fontSize: "80px", margin: "0 0 20px 0" }}>🍦</h1>
            <h2 style={{ color: "#5D534A", fontFamily: "serif", fontStyle: "italic", fontSize: "32px", margin: 0 }}>Sweet Victory!</h2>
            <p style={{ fontWeight: "700", color: "#AAA", textTransform: "uppercase", fontSize: "10px", letterSpacing: "2px", margin: "10px 0" }}>Free Ice Cream Unlocked</p>
            <div style={{ background: "#FDF8F2", border: "2px solid #5D534A", padding: "20px", borderRadius: "20px", margin: "25px 0", fontSize: "22px", fontWeight: "900", color: "#5D534A", fontFamily: "monospace" }}>
              SWEET-{orderId.slice(-4).toUpperCase()}
            </div>
            <button onClick={() => { setShowRewardModal(false); setTotalPoints(0); }} style={{ width: "100%", background: "#5D534A", color: "white", border: "none", padding: "18px", borderRadius: "20px", cursor: "pointer", fontWeight: "900", textTransform: "uppercase", fontSize: "12px" }}>Back to Dashboard</button>
          </div>
        </div>
      )}

      {/* ⭐ RATING POPUP */}
      {showRatingPopup && orderDetails && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(93, 83, 74, 0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "white", padding: "40px", borderRadius: "40px", width: "100%", maxWidth: "450px", textAlign: "center", border: "3px solid #5D534A" }}>
            <h2 style={{ color: "#5D534A", fontFamily: "serif", fontStyle: "italic", fontSize: "28px", marginBottom: "30px" }}>Rate Your Experience</h2>
           
            <div style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "10px" }}>
              {orderDetails.items?.map((dish, index) => (
                <div key={index} style={{ marginBottom: "25px", borderBottom: "1px solid #FAF7F2", paddingBottom: "15px" }}>
                  <p style={{ fontWeight: "800", fontSize: "14px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>{dish.name}</p>
                  <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRatings((prev) => ({ ...prev, [dish.name]: star }))}
                        onMouseEnter={() => setHoverRating((prev) => ({ ...prev, [dish.name]: star }))}
                        onMouseLeave={() => setHoverRating((prev) => ({ ...prev, [dish.name]: 0 }))}
                        style={{ cursor: "pointer", fontSize: "36px", color: (hoverRating[dish.name] || ratings[dish.name]) >= star ? "#D4A373" : "#EEE", transition: "0.2s" }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={submitRatings} style={{ marginTop: "30px", width: "100%", padding: "18px", border: "none", borderRadius: "20px", background: "#5D534A", color: "white", fontSize: "14px", fontWeight: "900", cursor: "pointer", textTransform: "uppercase" }}>Submit Feedback</button>
            <button onClick={() => setShowRatingPopup(false)} style={{ marginTop: "15px", background: "none", border: "none", color: "#AAA", cursor: "pointer", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>Maybe Later</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;