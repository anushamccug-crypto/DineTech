import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService"; 
import GamesHub from "./GamesHub"; 

function CustomerMenu() {
  // ================= API CONFIG =================
  const API_BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://dine-tech-iyqs.vercel.app";

  // ================= STATES =================
  const [dishes, setDishes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("Chef’s Signature Specials");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [flippedCard, setFlippedCard] = useState(null);
  const [proteinPriority, setProteinPriority] = useState(false);

  // --- LOGIN & MODAL STATES ---
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  // --- LIVE ORDER & TRACKING ---
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState("PLACED");
  const [orderDetails, setOrderDetails] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [ratings, setRatings] = useState({});
  const [hoverRating, setHoverRating] = useState({});

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const navigate = useNavigate();

  // ================= FETCHING LOGIC =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dishRes = await axios.get(`${API_BASE_URL}/api/dishes`);
        const invRes = await axios.get(`${API_BASE_URL}/api/inventory`);
        setDishes(dishRes.data);
        setInventory(invRes.data);
      } catch (err) { console.error("Fetch Error:", err); }
    };
    fetchData();
  }, [API_BASE_URL]);

  const fetchOrder = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders/${id}`);
      const order = res.data;
      setOrderDetails(order);
      setOrderStatus(order.status);
      
      const rated = localStorage.getItem(`orderRated_${id}`);
      if (order.status === "SERVED" && !rated) setShowRatingPopup(true);
      if (remainingTime === 0 && order.status !== "SERVED") {
        setRemainingTime((order.estimatedPrepTime || 15) * 60);
      }
    } catch (err) { console.error("Order update error:", err); }
  };

  useEffect(() => {
    const id = localStorage.getItem("latestOrderId");
    if (id) {
      setOrderId(id);
      fetchOrder(id);
      const interval = setInterval(() => fetchOrder(id), 5000);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (remainingTime <= 0) return;
    const timer = setInterval(() => setRemainingTime(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [remainingTime]);

  // ================= HANDLERS =================
  const addToCart = (dish) => {
    const exists = cart.find(i => i.dish._id === dish._id);
    if (exists) setCart(cart.map(i => i.dish._id === dish._id ? { ...i, quantity: i.quantity + 1 } : i));
    else setCart([...cart, { dish, quantity: 1 }]);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ email: loginEmail, password: loginPassword });
      if (data.role === "admin") navigate("/admin");
      else if (data.role === "kitchen") navigate("/kitchen-home");
    } catch { setLoginMessage("Invalid credentials"); }
  };

  // ✅ FIX FOR VERCEL BUILD ERROR
  const submitRatings = () => {
    if (Object.keys(ratings).length === 0) return alert("Please rate a dish ⭐");
    localStorage.setItem(`orderRated_${orderId}`, "true");
    setShowRatingPopup(false);
    alert("Feedback Submitted!");
  };

  const formatTime = (sec) => `${Math.floor(sec / 60)}m ${sec % 60}s`;

  // ================= FILTERING =================
  const isDishAvailable = (dish) => {
    if (!dish.ingredients?.length) return true;
    return dish.ingredients.every(ing => {
      const stock = inventory.find(i => i.ingredientName.toLowerCase() === ing.toLowerCase());
      return !stock || stock.quantityAvailable > 0;
    });
  };

  let filtered = dishes.filter(isDishAvailable);
  if (searchTerm) filtered = filtered.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  else filtered = filtered.filter(d => d.category === categoryFilter);

  const statusSteps = ["PLACED", "PREPARING", "READY", "SERVED"];
  const progressWidth = ((statusSteps.indexOf(orderStatus) + 1) / statusSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-100 to-blue-100 p-8">
      
      {/* TRACKER BAR */}
      {orderId && orderStatus !== "SERVED" && (
        <div className="max-w-4xl mx-auto mb-8 bg-white/90 p-6 rounded-3xl shadow-xl border border-purple-200">
           <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-purple-900">Order for {orderDetails?.customerName || "Customer"}</h3>
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">{orderStatus}</span>
           </div>
           <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div style={{ width: `${progressWidth}%` }} className="h-full bg-purple-600 transition-all duration-1000" />
           </div>
           <div className="flex justify-between mt-3">
              <p className="text-sm">⏱ Remaining: <b>{formatTime(remainingTime)}</b></p>
              <button onClick={() => setShowGameModal(true)} className="text-xs bg-indigo-500 text-white px-3 py-1 rounded-lg">🎮 Play Games</button>
           </div>
        </div>
      )}

      {/* HEADER & FILTERS */}
      <div className="sticky top-4 z-50 bg-white/50 backdrop-blur-md rounded-2xl p-6 shadow-lg mb-8">
        <div className="grid md:grid-cols-5 gap-4">
          <input type="text" placeholder="Search..." className="p-3 rounded-xl border-none outline-none" onChange={e => setSearchTerm(e.target.value)} />
          <button onClick={() => navigate("/cart")} className="bg-purple-600 text-white p-3 rounded-xl font-bold">🛒 Cart ({cart.length})</button>
          <button onClick={() => setShowLogin(true)} className="border-2 border-purple-600 text-purple-600 p-3 rounded-xl font-bold">🔑 Staff</button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* SIDEBAR */}
        <div className="w-64 space-y-2">
          {["Chef’s Signature Specials", "Vegetarian Starters", "Non-Vegetarian Starters", "Desserts", "Beverages"].map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)} className={`w-full text-left p-3 rounded-xl ${categoryFilter === c ? 'bg-purple-600 text-white' : 'bg-white/40'}`}>{c}</button>
          ))}
        </div>

        {/* GRID */}
        <div className="flex-1 grid md:grid-cols-3 gap-6">
          {filtered.map(dish => (
            <div key={dish._id} className="bg-white rounded-3xl p-4 shadow-md h-[400px] flex flex-col justify-between">
              <img src={dish.imageUrl} className="h-40 w-full object-cover rounded-2xl" alt="" />
              <h3 className="font-bold mt-2">{dish.name}</h3>
              <p className="text-purple-700 font-bold">₹{dish.price}</p>
              <button onClick={() => addToCart(dish)} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold">Add to Cart</button>
            </div>
          ))}
        </div>
      </div>

      {/* MODALS */}
      {showGameModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl relative">
            <button onClick={() => setShowGameModal(false)} className="absolute -top-10 right-0 text-white text-2xl">Close ✕</button>
            <GamesHub />
          </div>
        </div>
      )}

      {showRatingPopup && (
        <div className="fixed inset-0 z-[300] bg-black/70 flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl text-center w-80">
            <h3 className="font-bold mb-4">Rate Your Experience!</h3>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(s => (
                <span key={s} onClick={() => setRatings({all: s})} className={`text-3xl cursor-pointer ${ratings.all >= s ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
            </div>
            <button onClick={submitRatings} className="w-full bg-purple-600 text-white py-3 rounded-xl">Submit</button>
          </div>
        </div>
      )}

      {showLogin && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center">
          <div className="bg-white p-10 rounded-3xl w-96 relative">
            <button onClick={() => setShowLogin(false)} className="absolute top-4 right-4">✖</button>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
               <input type="email" placeholder="Email" className="w-full p-4 bg-gray-100 rounded-xl" onChange={e => setLoginEmail(e.target.value)} />
               <input type="password" placeholder="Password" className="w-full p-4 bg-gray-100 rounded-xl" onChange={e => setLoginPassword(e.target.value)} />
               <button className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold">Login</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerMenu;