import React, { useEffect, useState } from "react";

function KitchenOrders() {

  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders/today");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      fetchOrders();
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Kitchen Orders (Today)
      </h1>

      {orders.length === 0 ? (
        <p>No orders today</p>
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
              Prep Time: {order.estimatedPrepTime} min
            </p>

            <div className="mt-3">
              <p className="font-semibold">Items:</p>

              {order.items.map((item, index) => (
                <p key={index}>
                  {item.name} x {item.quantity}
                </p>
              ))}
            </div>

            <div className="flex gap-2 mt-4">

              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded"
                onClick={() =>
                  updateStatus(order._id, "PREPARING")
                }
              >
                Preparing
              </button>

              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={() =>
                  updateStatus(order._id, "PAID")
                }
              >
                Ready
              </button>

            </div>

          </div>
        ))
      )}

    </div>
  );
}

export default KitchenOrders;
