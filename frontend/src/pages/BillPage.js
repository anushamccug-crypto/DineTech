import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BillPage() {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [timer, setTimer] = useState(10);
  const [loading, setLoading] = useState(false);
  const [specialNote, setSpecialNote] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const navigate = useNavigate();
  const orderCreatedRef = useRef(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("pendingCart"));
    const savedCustomer = localStorage.getItem("pendingCustomer");
    const savedTotal = localStorage.getItem("pendingTotal");

    if (savedCart) setCart(savedCart);
    if (savedCustomer) setCustomerName(savedCustomer);
    if (savedTotal) setTotalAmount(Number(savedTotal));
  }, []);

  const confirmOrderAfterPayment = async (method) => {
    if (orderCreatedRef.current) return;
    orderCreatedRef.current = true;

    try {
      const payload = { customerName, items: cart, totalAmount, method, specialNote };

      const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://dine-tech-iyqs.vercel.app"; // Your Backend URL

await axios.post(`${API_BASE_URL}/api/orders/confirm-payment`, paymentData);
      localStorage.setItem("latestOrderId", res.data.order._id);

      localStorage.removeItem("pendingCart");
      localStorage.removeItem("pendingCustomer");
      localStorage.removeItem("pendingTotal");

      setPaymentSuccess(true);
      setShowQR(false);
      setTimer(10);

      setTimeout(() => {
        navigate(`/receipt/${res.data.order._id}`);
      }, 2000);

    } catch (error) {
      console.error(error);
      alert("❌ Order failed after payment");
      orderCreatedRef.current = false;
    }
  };

  const payCash = async () => {
    if (loading) return;
    setLoading(true);
    await confirmOrderAfterPayment("CASH");
    setLoading(false);
  };

  useEffect(() => {
    if (showQR && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }

    if (timer === 0 && showQR && !paymentSuccess) {
      confirmOrderAfterPayment("QR");
    }
  }, [showQR, timer, paymentSuccess]);

  if (!cart || cart.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #7c3aed 60%, #ec4899 100%)"
        }}
      >
        <h3 className="text-white text-xl font-semibold">⚠ No Bill Found</h3>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "linear-gradient(135deg, #a83aed 0%, #a83aed 60%, #ec4899 100%)"
      }}
    >

      {/* PAYMENT CARD */}
      <div
        className="w-full max-w-xl p-8 rounded-3xl shadow-2xl animate-float"
        style={{
          background: "linear-gradient(135deg, #fbf4ff)"
        }}
      >

        {/* HEADING */}
        <h2 className="text-3xl font-bold text-center text-purple-700 mb-8">
          PAYMENT
        </h2>

        {/* CUSTOMER */}
        <div className="flex justify-between text-base mb-5">
          <span className="font-semibold text-gray-600">Customer</span>
          <span className="font-medium text-gray-800">{customerName}</span>
        </div>

        <hr className="mb-5"/>

        {/* ITEMS */}
        <div className="space-y-3">
          {cart.map((item) => (
            <div
              key={item.dishId}
              className="flex justify-between items-center
              bg-white px-4 py-3 rounded-xl shadow-sm"
            >
              <div>
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500">
                  ₹{item.price} × {item.quantity}
                </p>
              </div>

              <p className="font-bold text-purple-700">
                ₹ {item.price * item.quantity}
              </p>
            </div>
          ))}
        </div>

        <hr className="my-6"/>

        {/* TOTAL */}
        <div className="flex justify-between items-center text-xl font-bold text-purple-700">
          <span>Total</span>
          <span>₹ {totalAmount}</span>
        </div>

        <hr className="my-6"/>

        {/* SPECIAL NOTE */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-2">
            Add Special Instructions for the Chef
          </h4>

          <textarea
            placeholder="Example: Less oil, no onion, less spicy..."
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
            className="w-full border rounded-xl p-3
            focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {!paymentSuccess && (
          <>
            <h3 className="font-semibold mb-3 text-gray-700">
              Select Payment Method
            </h3>

            <div className="flex gap-4">

              <button
                onClick={payCash}
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-white font-bold
                bg-green-500 hover:bg-green-600 transition"
              >
                {loading ? "Processing..." : "💵 Pay Cash"}
              </button>

              <button
                onClick={() => {
                  setShowQR(true);
                  setTimer(10);
                }}
                className="flex-1 py-3 rounded-xl text-white font-bold
                bg-purple-600 hover:bg-purple-700 transition"
              >
                📱 Pay QR
              </button>

            </div>
          </>
        )}

        {/* QR SECTION */}
        {showQR && !paymentSuccess && (
          <div className="text-center mt-6">

            <h4 className="font-semibold text-gray-700">
              Scan QR to Pay
            </h4>

            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RestaurantPayment"
              alt="QR"
              className="mx-auto my-4"
            />

            <p className="font-bold text-purple-700">
              QR expires in {timer}s
            </p>

          </div>
        )}

        {/* SUCCESS */}
        {paymentSuccess && (
          <div className="text-center mt-6 p-6 rounded-xl bg-green-100 animate-burst">

            <h3 className="text-green-700 text-2xl font-bold">
              🎉 Payment Successful
            </h3>

            <p className="text-green-700 mt-2">
              Redirecting to your receipt...
            </p>

          </div>
        )}

      </div>

      {/* ANIMATIONS */}
      <style>
        {`
        @keyframes float {
          from { transform: translateY(0px); }
          to { transform: translateY(-10px); }
        }

        .animate-float{
          animation: float 4s ease-in-out infinite alternate;
        }

        @keyframes burst {
          0% { transform: scale(0.7); opacity:0 }
          60% { transform: scale(1.1); opacity:1 }
          100% { transform: scale(1); }
        }

        .animate-burst{
          animation: burst 0.6s ease;
        }
        `}
      </style>

    </div>
  );
}

export default BillPage;

