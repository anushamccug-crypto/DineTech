import React, { useEffect, useState } from "react";

function OrderHistory() {

  const [orders, setOrders] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders/history");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Order History
      </h1>

      {orders.length === 0 ? (
        <p>No previous orders</p>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="bg-white p-5 rounded-lg shadow mb-4"
          >

            <h2 className="font-bold text-lg">
              {order.customerName}
            </h2>

            <p className="text-sm text-gray-600">
              Total: ₹{order.totalAmount}
            </p>

            <p className="text-sm">
              Status: {order.status}
            </p>

            <p className="text-sm">
              Date: {new Date(order.createdAt).toLocaleString()}
            </p>

            <div className="mt-3">
              <p className="font-semibold">Items:</p>

              {order.items.map((item, index) => (
                <p key={index}>
                  {item.name} x {item.quantity}
                </p>
              ))}
            </div>

          </div>
        ))
      )}

    </div>
  );
}

export default OrderHistory;
