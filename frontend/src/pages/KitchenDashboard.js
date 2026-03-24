import React, { useEffect, useState } from "react";
import axios from "axios";

function KitchenDashboard() {
  const [orders, setOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [ingredientName, setIngredientName] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState("orders");
  const [hiddenOrders, setHiddenOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders");
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
    if (activeTab === "history") {
      interval = setInterval(fetchAllOrders, 5000);
    }

    return () => clearInterval(interval);
  }, [activeTab]);

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${id}/status`, {
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
      await axios.post("http://localhost:5000/api/admin/kitchen-updates", {
        name: ingredientName,
        description,
      });

      // Clear form fields after submission
      setIngredientName("");
      setDescription("");
      alert("Message sent to Admin");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #ffe4e6, #ede9fe, #dbeafe)",
        fontFamily: "Arial",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* NAVBAR */}
      <div
        style={{
          background: "linear-gradient(90deg,#6a11cb,#ff4ecd)",
          color: "white",
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ fontWeight: "bold" }}>🍳 Kitchen Dashboard</h2>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setActiveTab("orders")}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              background:
                activeTab === "orders" ? "white" : "rgba(255,255,255,0.25)",
              color: activeTab === "orders" ? "#6a11cb" : "white",
              fontWeight: "bold",
            }}
          >
            Kitchen Orders
          </button>

          <button
            onClick={() => setActiveTab("history")}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              background:
                activeTab === "history" ? "white" : "rgba(255,255,255,0.25)",
              color: activeTab === "history" ? "#6a11cb" : "white",
              fontWeight: "bold",
            }}
          >
            Order History
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              background:
                activeTab === "messages" ? "white" : "rgba(255,255,255,0.25)",
              color: activeTab === "messages" ? "#6a11cb" : "white",
              fontWeight: "bold",
            }}
          >
            Stock Update
          </button>
        </div>
      </div>

      <div style={{ padding: "30px", flex: 1 }}>
        {/* TODAY ORDERS */}
        {activeTab === "orders" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
              gap: "20px",
            }}
          >
            {orders
              .filter((order) => !hiddenOrders.includes(order._id))
              .map((order) => (
                <div
                  key={order._id}
                  style={{
                    background: "linear-gradient(to bottom right,#fdf4ff,#f0f9ff)",
                    padding: "20px",
                    borderRadius: "14px",
                    boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  <button
                    onClick={() => removeOrder(order._id)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "10px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    ❌
                  </button>

                  <h3>{order.customerName}</h3>
                  <p>
                    <strong>Status:</strong> {order.status}
                  </p>

                  <ul>
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>

                  {order.specialNote && (
                    <div
                      style={{
                        background: "#efb6f6",
                        padding: "8px",
                        borderRadius: "6px",
                        marginTop: "10px",
                      }}
                    >
                      📝 {order.specialNote}
                    </div>
                  )}

                  <div style={{ marginTop: "10px" }}>
                    {order.status === "PLACED" && (
                      <button
                        onClick={() => updateStatus(order._id, "PREPARING")}
                        style={{
                          background: "#c084fc",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Start Preparing
                      </button>
                    )}

                    {order.status === "PREPARING" && (
                      <button
                        onClick={() => updateStatus(order._id, "READY")}
                        style={{
                          background: "#e111a2",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Mark Ready
                      </button>
                    )}

                    {order.status === "READY" && (
                      <button
                        onClick={() => updateStatus(order._id, "SERVED")}
                        style={{
                          background: "#bd4c5b",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Mark Served
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* HISTORY ORDERS */}
        {activeTab === "history" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
              gap: "20px",
            }}
          >
            {historyOrders.map((order) => (
              <div
                key={order._id}
                style={{
                  background: "linear-gradient(to bottom right,#faf5ff,#f0fdfa)",
                  padding: "20px",
                  borderRadius: "14px",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
                }}
              >
                <h3>{order.customerName}</h3>
                <p>
                  <strong>Status:</strong> {order.status}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
                </p>

                <ul>
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* STOCK UPDATE FLOATING FORM */}
        {activeTab === "messages" && (
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              padding: "40px",
              borderRadius: "16px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
              zIndex: 1000,
              width: "90%",
              maxWidth: "600px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <p
              style={{
                color: "#6b21a8",
                fontSize: "22px",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              STOCK UPDATE
            </p>

            <form onSubmit={submitKitchenUpdate} style={{ width: "100%" }}>
              <input
                type="text"
                placeholder="Ingredient Name"
                value={ingredientName}
                onChange={(e) => setIngredientName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "15px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  marginBottom: "15px",
                }}
              />

              <select
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: "100%",
                  padding: "15px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  marginBottom: "20px",
                  backgroundColor: "white",
                  color: description ? "black" : "#999",
                }}
              >
                <option value="" disabled>
                  Select Status
                </option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Item Expired">Item Expired</option>
                <option value="Ingredient Spoiled">Ingredient Spoiled</option>
              </select>

              <button
                type="submit"
                style={{
                  width: "100%",
                  background: "#f9a8d4",
                  color: "white",
                  border: "none",
                  padding: "15px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Send to Admin
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default KitchenDashboard;
