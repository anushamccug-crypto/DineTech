import React, { useEffect, useState } from "react";
import axios from "axios";

function OrderSummary() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/orders")
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>📦 Order Summary</h2>

      {orders.length === 0 && <p>No orders found</p>}

      {orders.map((order) => (
        <div
          key={order._id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
            borderRadius: "10px",
          }}
        >
          <h4>👤 {order.customerName}</h4>
          <p>
            🕒 {new Date(order.createdAt).toLocaleString()}
          </p>

          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                {item.name} — ₹{item.price} × {item.quantity}
              </li>
            ))}
          </ul>

          <h4>Total: ₹ {order.totalAmount}</h4>
        </div>
      ))}
    </div>
  );
}

export default OrderSummary;
