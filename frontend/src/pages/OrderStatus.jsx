import React, { useEffect, useState } from "react";
import axios from "axios";

function OrderStatus() {
  const [orders, setOrders] = useState([]);
  const customerName = "Alice"; // later from login

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/orders/customer/${customerName}`)
      .then(res => setOrders(res.data));
  }, []);

  return (
    <div>
      <h2>My Orders</h2>

      {orders.map(order => (
        <div key={order._id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <p><b>Status:</b> {order.status}</p>
          <p><b>Total:</b> ₹{order.totalAmount}</p>
        </div>
      ))}
    </div>
  );
}

export default OrderStatus;
