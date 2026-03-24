import React, { useEffect, useState } from "react";
import axios from "axios";

function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [customerName, setCustomerName] = useState("");

  const fetchOrders = async () => {
    if (!customerName) return;

    const res = await axios.get("http://localhost:5000/api/orders");

    const filtered = res.data.filter(
      (order) => order.customerName === customerName
    );

    setOrders(filtered);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [customerName]);

  const statusColor = (status) => {
    switch (status) {
      case "PLACED":
        return "bg-gray-200 text-gray-700";
      case "PREPARING":
        return "bg-orange-200 text-orange-700";
      case "READY":
        return "bg-blue-200 text-blue-700";
      case "COMPLETED":
        return "bg-green-200 text-green-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-100 to-blue-100 p-8 animate-fadeInPage">

      {/* HEADER */}
      <div className="bg-white/40 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl p-8 text-center mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
          📦 Track Your Order
        </h1>
        <p className="text-gray-600 mt-2 text-sm">
          Enter your name to view your order status
        </p>
      </div>

      {/* SEARCH CUSTOMER */}
      <div className="bg-white/40 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl p-6 mb-10">
        <input
          placeholder="🔍 Enter your name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-400 outline-none"
        />
      </div>

      {/* ORDER LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

        {orders.length === 0 && customerName && (
          <div className="col-span-full text-center text-gray-600 text-lg py-20">
            😔 No orders found
          </div>
        )}

        {orders.map((order, index) => (
          <div
            key={order._id}
            className="bg-white/40 backdrop-blur-md border border-white/30 shadow-xl rounded-3xl p-6 animate-fadeIn hover:shadow-purple-300/40 hover:shadow-2xl transition"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <h3 className="font-bold text-lg text-gray-800 mb-2">
              Order #{order._id.slice(-6)}
            </h3>

            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 ${statusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>

            {/* ITEMS */}
            <ul className="space-y-1 text-sm text-gray-700 mb-4">
              {order.items.map((item) => (
                <li key={item.dishId}>
                  {item.name} × {item.quantity}
                </li>
              ))}
            </ul>

            <p className="font-semibold text-purple-700">
              Total: ₹{order.totalAmount}
            </p>

            {order.status === "READY" && (
              <p className="mt-3 text-green-600 font-semibold">
                ✅ Your order is ready for pickup!
              </p>
            )}
          </div>
        ))}
      </div>

      {/* PAGE ANIMATIONS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease forwards;
        }

        @keyframes fadeInPage {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeInPage {
          animation: fadeInPage 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default CustomerOrders;
