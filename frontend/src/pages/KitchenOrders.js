import React, { useEffect, useState } from "react";

function KitchenOrders() {
  const [orders, setOrders] = useState([]);

  // ✅ DYNAMIC URL: Fixes the 'localhost' issue for live users
  const API_BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://dine-tech-iyqs.vercel.app";

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/today`);
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Auto-refresh every 5 seconds to catch new orders
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      fetchOrders(); // Refresh list after status update
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-purple-800 border-b-2 border-purple-200 pb-2">
        🍳 Kitchen Display System
      </h1>

      {orders.length === 0 ? (
        <div className="bg-white p-10 rounded-xl text-center shadow-inner">
          <p className="text-gray-500 text-lg">No orders received today yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-purple-600 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="font-bold text-xl text-gray-800 capitalize">
                    {order.customerName}
                  </h2>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    order.status === "PREPARING" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl mb-4">
                  <p className="text-sm font-bold text-purple-700 mb-2 uppercase">Items:</p>
                  <ul className="space-y-2">
                    {/* ✅ RETAINED: Correct mapping of ordered products */}
                    {order.items && order.items.map((item, index) => (
                      <li key={index} className="flex justify-between text-gray-700 border-b border-purple-100 last:border-0 pb-1">
                        <span>{item.name}</span>
                        <span className="font-bold">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>💰 Total: <span className="text-gray-800 font-medium">₹{order.totalAmount}</span></p>
                  <p>⏳ Prep Time: <span className="text-gray-800 font-medium">{order.estimatedPrepTime || 15} min</span></p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg transition"
                  onClick={() => updateStatus(order._id, "PREPARING")}
                >
                  Preparing
                </button>

                <button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition"
                  onClick={() => updateStatus(order._id, "READY")}
                >
                  Ready
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KitchenOrders;