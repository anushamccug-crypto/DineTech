import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

// ✅ DYNAMIC URL: Supports both Localhost and Vercel
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://dine-tech-iyqs.vercel.app";

function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [ingredientName, setIngredientName] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState("orders");
  const [hiddenOrders, setHiddenOrders] = useState([]);
  
  const navigate = useNavigate();

  const fetchAllOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders`);
      const allOrders = res.data;
      const today = new Date().toDateString();

      const todayOrders = allOrders.filter(
        (order) => new Date(order.createdAt).toDateString() === today
      );
      const pastOrders = allOrders.filter(
        (order) => new Date(order.createdAt).toDateString() !== today
      );

      setOrders(todayOrders);
      setHistoryOrders(pastOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchAllOrders();
    let interval;
    if (activeTab === "orders" || activeTab === "history") {
      interval = setInterval(fetchAllOrders, 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/api/orders/${id}/status`, {
        status: newStatus,
      });
      fetchAllOrders();
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const removeOrder = (id) => {
    setHiddenOrders((prev) => [...prev, id]);
  };

  const submitKitchenUpdate = async (e) => {
    e.preventDefault();
    if (!ingredientName || !description) {
      alert("Please fill both fields");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/admin/kitchen-updates`, {
        name: ingredientName,
        description,
      });
      setIngredientName("");
      setDescription("");
      alert("Message sent to Admin successfully!");
      setActiveTab("orders");
    } catch (error) {
      console.error(error);
    }
  };

  // --- Theme Constants ---
  const colors = {
    espresso: "#5D534A",
    gold: "#D4A373",
    cream: "#FDF8F2",
    white: "#FFFFFF",
    softBorder: "rgba(93, 83, 74, 0.1)"
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.cream, fontFamily: "inherit", display: "flex", flexDirection: "column" }}>
      
      {/* NAVBAR */}
      <div style={{ background: colors.espresso, color: colors.white, padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <h2 style={{ fontWeight: "800", letterSpacing: "-0.5px", margin: 0 }}>🍳 KITCHEN SYSTEM</h2>

        <div style={{ display: "flex", gap: "12px" }}>
          {["orders", "history", "messages"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                background: activeTab === tab ? colors.gold : "rgba(255,255,255,0.1)",
                color: colors.white,
                fontWeight: "bold",
                fontSize: "12px",
                textTransform: "uppercase",
                transition: "all 0.3s ease"
              }}
            >
              {tab.replace("messages", "Stock Update")}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "40px", flex: 1 }}>
        
        {/* ORDERS VIEW */}
        {activeTab === "orders" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "25px" }}>
            {orders.filter((order) => !hiddenOrders.includes(order._id)).map((order) => (
              <div key={order._id} style={{ background: colors.white, padding: "24px", borderRadius: "20px", boxShadow: "0 10px 25px rgba(93, 83, 74, 0.05)", border: `1px solid ${colors.softBorder}`, position: "relative" }}>
                <button onClick={() => removeOrder(order._id)} style={{ position: "absolute", right: "15px", top: "15px", border: "none", background: "none", cursor: "pointer", opacity: 0.3 }}>✕</button>

                <div style={{ background: colors.gold, color: colors.white, padding: "4px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "900", display: "inline-block", marginBottom: "15px", letterSpacing: "1px" }}>
                  TABLE: {order.tableNumber || "N/A"}
                </div>

                <h3 style={{ color: colors.espresso, margin: "0 0 5px 0", fontSize: "1.2rem" }}>{order.customerName}</h3>
                <p style={{ fontSize: "12px", color: colors.gold, fontWeight: "bold", textTransform: "uppercase", marginBottom: "15px" }}>● {order.status}</p>

                <div style={{ background: colors.cream, padding: "15px", borderRadius: "12px", marginBottom: "20px" }}>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {order.items.map((item, idx) => (
                      <li key={idx} style={{ display: "flex", justifyContent: "space-between", color: colors.espresso, fontSize: "14px", paddingBottom: "8px", borderBottom: `1px solid ${colors.softBorder}`, marginBottom: "8px" }}>
                        <span>{item.name}</span>
                        <span style={{ fontWeight: "800", color: colors.gold }}>x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {order.specialNote && (
                  <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px" }}>
                    <strong>Note:</strong> {order.specialNote}
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px" }}>
                  {order.status === "PLACED" && (
                    <button onClick={() => updateStatus(order._id, "PREPARING")} style={{ flex: 1, background: colors.gold, color: colors.white, border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>Start Preparing</button>
                  )}
                  {order.status === "PREPARING" && (
                    <button onClick={() => updateStatus(order._id, "READY")} style={{ flex: 1, background: colors.espresso, color: colors.white, border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>Mark Ready</button>
                  )}
                  {order.status === "READY" && (
                    <button onClick={() => updateStatus(order._id, "SERVED")} style={{ flex: 1, background: "#2D6A4F", color: colors.white, border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" }}>Mark Served</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STOCK UPDATE FORM (Messages Tab) */}
        {activeTab === "messages" && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(93, 83, 74, 0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
            <div style={{ background: colors.white, padding: "40px", borderRadius: "24px", width: "90%", maxWidth: "500px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
              <h2 style={{ color: colors.espresso, textAlign: "center", marginBottom: "30px", fontWeight: "800" }}>KITCHEN UPDATES</h2>
              
              <form onSubmit={submitKitchenUpdate}>
                <input
                  type="text"
                  placeholder="Item Details (e.g. Biryani / Plates / NGO Name)"
                  value={ingredientName}
                  onChange={(e) => setIngredientName(e.target.value)}
                  style={{ width: "100%", padding: "15px", borderRadius: "12px", border: `2px solid ${colors.softBorder}`, marginBottom: "15px", outline: "none" }}
                />

                <select
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", padding: "15px", borderRadius: "12px", border: `2px solid ${colors.softBorder}`, marginBottom: "25px", background: colors.white }}
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Item Expired">Item Expired</option>
                  <option value="Ingredient Spoiled">Ingredient Spoiled</option>
                  <option value="Bulk Food for NGO Donation">Bulk Food for NGO Donation</option>
                </select>

                <button type="submit" style={{ width: "100%", background: colors.gold, color: colors.white, border: "none", padding: "15px", borderRadius: "12px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", marginBottom: "10px" }}>
                  Send Update to Admin
                </button>
                <button type="button" onClick={() => setActiveTab("orders")} style={{ width: "100%", background: "none", border: "none", color: colors.espresso, opacity: 0.6, cursor: "pointer" }}>Cancel</button>
              </form>
            </div>
          </div>
        )}

        {/* HISTORY VIEW */}
        {activeTab === "history" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
            {historyOrders.map((order) => (
              <div key={order._id} style={{ background: colors.white, padding: "20px", borderRadius: "15px", opacity: 0.8, border: `1px solid ${colors.softBorder}` }}>
                <div style={{ fontSize: "10px", color: colors.espresso, opacity: 0.5, marginBottom: "5px" }}>{new Date(order.createdAt).toLocaleString()}</div>
                <h4 style={{ margin: "0 0 10px 0", color: colors.espresso }}>{order.customerName} (Table {order.tableNumber})</h4>
                <div style={{ fontSize: "13px" }}>
                  {order.items.map((item, i) => <div key={i}>{item.name} x {item.quantity}</div>)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default KitchenDashboard;