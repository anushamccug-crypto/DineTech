import React, { useEffect, useState } from "react";

function KitchenOrders() {
  const [orders, setOrders] = useState([]);

  // ✅ DYNAMIC URL: Supports both Localhost and Vercel
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
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[#5D534A]/10 pb-4">
        <h1 className="text-2xl font-bold text-[#5D534A]">
          🍳 Kitchen Display System
        </h1>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A373]">
          Live Updates Every 5s
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/40 border-2 border-dashed border-[#5D534A]/10 p-20 rounded-3xl text-center">
          <p className="text-[#5D534A]/40 font-bold text-lg italic">No orders received today yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-[#5D534A]/5 flex flex-col justify-between transform transition-all hover:shadow-md"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h2 className="font-bold text-lg text-[#5D534A] capitalize">
                    {order.customerName}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    order.status === "PREPARING" 
                      ? "bg-[#D4A373]/20 text-[#D4A373]" 
                      : "bg-[#E6F3EF] text-[#2D6A4F]"
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="bg-[#FDF8F2] p-4 rounded-xl mb-4 border border-[#5D534A]/5">
                  <p className="text-[10px] font-black text-[#5D534A]/40 mb-2 uppercase tracking-widest">Order Items:</p>
                  <ul className="space-y-2">
                    {order.items && order.items.map((item, index) => (
                      <li key={index} className="flex justify-between text-[#5D534A] text-sm border-b border-[#5D534A]/5 last:border-0 pb-1">
                        <span className="font-medium">{item.name}</span>
                        <span className="font-bold text-[#D4A373]">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-[#5D534A]/50">
                   <p>💰 ₹{order.totalAmount}</p>
                   <p>⏳ {order.estimatedPrepTime || 15} MINS</p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  className="flex-1 bg-[#D4A373]/10 text-[#D4A373] hover:bg-[#D4A373] hover:text-[#FDF8F2] font-bold py-2 rounded-xl text-xs transition-all active:scale-95 uppercase tracking-widest"
                  onClick={() => updateStatus(order._id, "PREPARING")}
                >
                  Preparing
                </button>

                <button
                  className="flex-1 bg-[#5D534A] text-[#FDF8F2] hover:bg-[#2D6A4F] font-bold py-2 rounded-xl text-xs transition-all active:scale-95 uppercase tracking-widest shadow-sm shadow-[#5D534A]/20"
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