import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ================= VERCEL / BACKEND CONFIGURATION =================
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://dine-tech-iyqs.vercel.app";

function BillPage() {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [specialNote, setSpecialNote] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  const navigate = useNavigate();
  const orderCreatedRef = useRef(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("pendingCart"));
    const savedCustomer = localStorage.getItem("pendingCustomer");
    const savedTable = localStorage.getItem("pendingTable");
    const savedTotal = localStorage.getItem("pendingTotal");

    if (savedCart) setCart(savedCart);
    if (savedCustomer) setCustomerName(savedCustomer);
    if (savedTable) setTableNumber(savedTable);
    if (savedTotal) setTotalAmount(Number(savedTotal));
  }, []);

  const confirmOrderAfterPayment = async (method) => {
    if (orderCreatedRef.current) return;
    orderCreatedRef.current = true;
    setPaymentMethod(method);

    try {
      const payload = { 
        customerName, 
        tableNumber: tableNumber || "N/A", 
        items: cart, 
        totalAmount, 
        method, 
        specialNote: specialNote || ""
      };

      // POST request to backend
      const res = await axios.post(`${API_BASE_URL}/api/orders/confirm-payment`, payload);

      if (res.data && res.data.order) {
        localStorage.setItem("latestOrderId", res.data.order._id);
        
        // CLEANUP: Only remove items on success
        localStorage.removeItem("pendingCart");
        localStorage.removeItem("pendingCustomer");
        localStorage.removeItem("pendingTotal");
        localStorage.removeItem("pendingTable");

        setPaymentSuccess(true);
        setShowRazorpay(false);

        // Navigation to Receipt
        setTimeout(() => {
          navigate(`/receipt/${res.data.order._id}`);
        }, 3000);
      }

    } catch (error) {
      console.error("Order Error:", error.response?.data || error.message);
      alert(`❌ Order failed: ${error.response?.data?.message || "Internal Server Error"}`);
      orderCreatedRef.current = false;
      setLoading(false);
    }
  };

  const startRazorpayDemo = () => setShowRazorpay(true);

  const handleDemoPaymentComplete = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      confirmOrderAfterPayment("RAZORPAY");
    }, 2500);
  };

  const payCash = async () => {
    if (loading) return;
    setLoading(true);
    await confirmOrderAfterPayment("CASH");
    setLoading(false);
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F2] text-[#5D534A] font-serif italic">
        <p className="text-2xl mb-4">⚠ No pending bill found.</p>
        <button onClick={() => navigate("/")} className="px-8 py-3 bg-[#5D534A] text-white rounded-xl font-bold uppercase tracking-widest text-[10px]">Go to Menu</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FDF8F2] relative overflow-hidden font-sans">
      
      {/* AMBIENT BACKGROUND */}
      <div className="absolute top-[-10%] left-[-5%] w-[70%] h-[50%] bg-[#E6F3EF] rounded-full blur-[120px] opacity-60 z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[50%] bg-[#FFF0F0] rounded-full blur-[120px] opacity-60 z-0"></div>

      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-3xl p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-[3px] border-[#5D534A]">
        
        <div className="text-center mb-6 border-b border-[#F1E9E0] pb-4">
          <h2 className="text-3xl font-serif italic text-[#5D534A] tracking-tighter">Finalize Order</h2>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#D4A373] font-black mt-1">Checkout Summary</p>
        </div>

        {/* Guest Info Card */}
        <div className="bg-[#FAF7F2] p-4 rounded-2xl mb-6 flex justify-between border border-[#F1E9E0]">
          <div>
            <p className="text-[8px] uppercase font-black text-gray-400 tracking-widest">Guest</p>
            <p className="font-bold text-[#5D534A]">{customerName}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] uppercase font-black text-gray-400 tracking-widest">Table</p>
            <p className="font-bold text-[#5D534A]">{tableNumber}</p>
          </div>
        </div>

        {/* Item List */}
        <div className="space-y-3 max-h-32 overflow-y-auto pr-2 mb-6 no-scrollbar">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between items-center border-b border-[#F1E9E0] pb-2 text-sm">
              <div>
                <p className="font-serif text-[#4A423B] leading-tight">{item.name}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-[#D4A373]">₹{item.price * item.quantity}</p>
            </div>
          ))}
        </div>

        {/* Total Section */}
        <div className="bg-[#5D534A] text-white p-5 rounded-2xl mb-6 border-2 border-[#F1E9E0] shadow-md flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Total Payable</span>
          <span className="text-3xl font-serif italic font-bold">₹{totalAmount}</span>
        </div>

        {!paymentSuccess ? (
          <>
            <div className="group mb-6">
              <label className="text-[8px] font-black text-gray-400 uppercase ml-3 tracking-widest">Kitchen Note</label>
              <textarea
                placeholder="Example: Less oil, more spicy..."
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                className="w-full border border-[#5D534A] rounded-xl p-3 focus:border-[#D4A373] outline-none text-xs bg-white/50 h-16 resize-none transition-all"
              />
            </div>
            
            <div className="flex gap-3">
              <button onClick={payCash} disabled={loading} className="flex-1 py-4 rounded-xl text-white font-bold text-[10px] uppercase tracking-widest bg-[#2D6A4F] hover:bg-[#1B4332] transition-all shadow-lg active:scale-95">
                {loading ? "WAIT..." : "💵 Cash"}
              </button>
              <button onClick={startRazorpayDemo} className="flex-1 py-4 rounded-xl text-white font-bold text-[10px] uppercase tracking-widest bg-[#D4A373] hover:bg-[#5D534A] transition-all shadow-lg active:scale-95">
                💳 Razorpay
              </button>
            </div>
          </>
        ) : (
          <div className={`text-center p-6 rounded-2xl border-2 transition-all animate-pulse ${paymentMethod === "CASH" ? "bg-[#FAF7F2] border-[#D4A373]" : "bg-[#E6F3EF] border-[#2D6A4F]"}`}>
            <h3 className={`text-xl font-serif italic font-bold ${paymentMethod === "CASH" ? "text-[#D4A373]" : "text-[#2D6A4F]"}`}>
              {paymentMethod === "CASH" ? "Order Sent to Kitchen!" : "Payment Successful!"}
            </h3>
            <p className="mt-2 text-[#5D534A] text-[10px] uppercase tracking-widest font-bold">Generating Receipt...</p>
          </div>
        )}

        {/* RAZORPAY MODAL */}
        {showRazorpay && (
          <div className="fixed inset-0 bg-[#5D534A]/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-[360px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-[#F1E9E0]">
              <div className="bg-[#D4A373] p-6 text-center text-white relative">
                <button onClick={() => setShowRazorpay(false)} className="absolute left-5 top-6 text-white hover:scale-110 transition-transform font-bold">✕</button>
                <p className="text-[8px] uppercase tracking-[0.2em] opacity-80 mb-1 font-black">Secure Checkout</p>
                <h3 className="text-4xl font-serif italic font-bold">₹{totalAmount}.00</h3>
              </div>
              <div className="p-6">
                {isProcessing ? (
                  <div className="py-10 text-center">
                    <div className="w-12 h-12 border-4 border-[#F1E9E0] border-t-[#D4A373] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#5D534A] font-bold text-sm">Validating Payment...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="bg-[#FAF7F2] p-4 rounded-2xl inline-block border-2 border-dashed border-[#D4A373]/30 mb-4">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=demo@upi&pn=TasteCrafts&am=${totalAmount}&cu=INR`)}`} 
                          alt="Payment QR" 
                          className="mx-auto rounded-lg mix-blend-multiply"
                        />
                      </div>
                      <p className="text-[10px] text-[#D4A373] font-black uppercase tracking-widest italic">VPA: dine@upi</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <input type="text" placeholder="upi-id@okaxis" className="flex-1 px-4 py-3 border border-[#5D534A] rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#D4A373]" />
                      <button onClick={handleDemoPaymentComplete} className="bg-[#5D534A] text-white px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#D4A373] transition-all">PAY</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;700;800&display=swap');
        .font-sans { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

export default BillPage;
