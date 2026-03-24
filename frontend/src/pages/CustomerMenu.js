import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService"; 
import GamesHub from "./GamesHub";

const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://dine-tech-iyqs.vercel.app";

function CustomerMenu() {
  // ================= ORIGINAL MENU STATES =================
  const [dishes, setDishes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("Chef’s Signature Specials");
  const [selectedAllergy, setSelectedAllergy] = useState("");
  const [proteinPriority, setProteinPriority] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [flippedCard, setFlippedCard] = useState(null);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart")) || []);

  // ================= LIVE ORDER & TRACKING STATES =================
  const [orderId, setOrderId] = useState(localStorage.getItem("latestOrderId"));
  const [orderStatus, setOrderStatus] = useState("PLACED");
  const [orderDetails, setOrderDetails] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [ratings, setRatings] = useState({});
  const [hoverRating, setHoverRating] = useState({});

  // ================= LOGIN STATES =================
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  const navigate = useNavigate();

  // ================= FETCH DATA & LIVE SYNC =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dishRes, invRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/dishes`),
          axios.get(`${API_BASE_URL}/api/inventory`)
        ]);
        setDishes(dishRes.data);
        setInventory(invRes.data);
      } catch (err) { console.error("Fetch error:", err); }
    };
    fetchData();
  }, []);

  const fetchOrder = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders/${id}`);
      const order = res.data;
      setOrderDetails(order);
      setOrderStatus(order.status);
      if (order.status === "SERVED" && !localStorage.getItem(`orderRated_${id}`)) {
        setShowRatingPopup(true);
      }
      if (remainingTime === 0 && order.status !== "SERVED") {
        setRemainingTime((order.estimatedPrepTime || 15) * 60);
      }
    } catch (err) { console.error("Order update error:", err); }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
      const interval = setInterval(() => fetchOrder(orderId), 5000);
      return () => clearInterval(interval);
    }
  }, [orderId]);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setInterval(() => setRemainingTime(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [remainingTime]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ================= LOGIC & HANDLERS =================
  const submitRatings = () => {
    localStorage.setItem(`orderRated_${orderId}`, "true");
    setShowRatingPopup(false);
    alert("Feedback Submitted! Thank you.");
  };

  const allergyMap = { DAIRY: ["Milk", "Butter", "Cheese", "Paneer"], NUTS: ["Peanut", "Almond", "Cashew"], GLUTEN: ["Wheat Flour", "Maida"], FISH: ["Seer Fish", "Fish"] };
  const isDishAvailable = (dish) => {
    if (!dish.ingredients?.length) return true;
    return dish.ingredients.every(ing => {
      const stock = inventory.find(i => i.ingredientName.toLowerCase() === ing.toLowerCase());
      return !stock || stock.quantityAvailable > 0;
    });
  };

  const isRestrictedDish = (dish) => {
    if (!selectedAllergy) return false;
    const mapped = allergyMap[selectedAllergy].map(a => a.toLowerCase().trim());
    return (dish.ingredients || []).some(i => mapped.includes(i.toLowerCase().trim()));
  };

  const addToCart = (dish) => {
    if (isRestrictedDish(dish)) return alert("Contains your selected allergen!");
    const exists = cart.find(i => i.dish._id === dish._id);
    if (exists) setCart(cart.map(i => i.dish._id === dish._id ? { ...i, quantity: i.quantity + 1 } : i));
    else setCart([...cart, { dish, quantity: 1 }]);
  };

  // ================= FILTERING =================
  let filteredDishes = dishes.filter(isDishAvailable);
  if (searchTerm) filteredDishes = filteredDishes.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  else if (proteinPriority) filteredDishes.sort((a, b) => (b.nutrition?.protein || 0) - (a.nutrition?.protein || 0));
  else filteredDishes = filteredDishes.filter(d => d.category === categoryFilter);

  const formatTime = (sec) => `${Math.floor(sec / 60)}m ${sec % 60}s`;
  const statusColors = { PLACED: "#ff6ec7", PREPARING: "#d16ba5", READY: "#b185db", SERVED: "#845ec2" };
  const progressWidth = ((["PLACED", "PREPARING", "READY", "SERVED"].indexOf(orderStatus) + 1) / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-100 to-blue-100 p-8">
      
      {/* 🟢 NEW: DYNAMIC ORDER TRACKER (Only shows if there is an active order) */}
      {orderId && orderStatus !== "SERVED" && (
        <div className="max-w-4xl mx-auto mb-10 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-purple-200">
           <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-purple-900">Live Order: #{orderId.slice(-6)}</h3>
                <p className="text-sm text-purple-700">Customer: <b>{orderDetails?.customerName || "Loading..."}</b></p>
              </div>
              <span className="px-4 py-1 rounded-full text-white font-bold" style={{ background: statusColors[orderStatus] }}>{orderStatus}</span>
           </div>
           <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div style={{ width: `${progressWidth}%`, background: statusColors[orderStatus] }} className="h-full transition-all duration-1000" />
           </div>
           <div className="flex justify-between mt-4">
              <p className="text-sm font-medium">⏱ Prep Time: {formatTime(remainingTime)} left</p>
              <button onClick={() => setShowGameModal(true)} className="bg-purple-600 text-white px-4 py-1 rounded-xl text-xs font-bold shadow-md hover:bg-purple-700">🎮 Play Games</button>
           </div>
        </div>
      )}

      {/* 🔵 RESTORED HEADER & FILTERS */}
      <div className="sticky top-4 z-50 bg-white/40 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl p-6 space-y-6 mb-10">
        <div className="text-center"><h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">🍽 TasteCraft</h1></div>
        <div className="grid md:grid-cols-6 gap-4 items-center">
          <input type="text" placeholder="🔍 Search..." className="px-4 py-3 rounded-xl bg-white/70 outline-none" onChange={e => setSearchTerm(e.target.value)} />
          <select value={selectedAllergy} onChange={e => setSelectedAllergy(e.target.value)} className="px-4 py-3 rounded-xl bg-white/70">
            <option value="">No Allergy</option><option value="DAIRY">Dairy</option><option value="NUTS">Nuts</option>
          </select>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={proteinPriority} onChange={() => setProteinPriority(!proteinPriority)} /> 💪 Protein</label>
          <button onClick={() => navigate("/cart")} className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-lg">🛒 Cart ({cart.length})</button>
          <button onClick={() => setShowLogin(true)} className="px-6 py-3 rounded-xl border-2 border-purple-500 text-purple-700 font-bold">🔑 Staff</button>
        </div>
      </div>

      <div className="flex gap-10">
        {/* SIDEBAR */}
        <div className="w-72 space-y-3">
          {["Chef’s Signature Specials", "Vegetarian Starters", "Non-Vegetarian Starters", "Desserts", "Beverages"].map(section => (
            <button key={section} onClick={() => setCategoryFilter(section)} className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${categoryFilter === section ? "bg-purple-600 text-white shadow-lg" : "bg-white/40 hover:bg-purple-100"}`}>{section}</button>
          ))}
        </div>

        {/* DISH GRID WITH FLIP CARDS */}
        <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredDishes.map((dish, index) => (
            <div key={dish._id} className="perspective h-[450px]" style={{ animationDelay: `${index * 0.05}s` }}>
              <div onClick={() => setFlippedCard(flippedCard === dish._id ? null : dish._id)} className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${flippedCard === dish._id ? "rotate-y-180" : ""}`}>
                {/* FRONT */}
                <div className="absolute w-full h-full backface-hidden bg-white/90 rounded-3xl shadow-xl p-5">
                  <img src={dish.imageUrl} alt="" className="w-full h-48 object-cover rounded-xl" />
                  <h3 className="font-bold text-lg mt-4">{dish.name}</h3>
                  <p className="text-purple-700 font-bold mt-2">₹ {dish.price}</p>
                </div>
                {/* BACK */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white/95 rounded-3xl shadow-xl p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <p className="text-sm italic">✨ {dish.description || "Chef's special preparation."}</p>
                    <div className="text-xs">Protein: {dish.nutrition?.protein}g | Calories: {dish.nutrition?.calories}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); addToCart(dish); }} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold">Add to Cart</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODALS (Game, Login, Rating) */}
      {showGameModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl relative">
            <button onClick={() => setShowGameModal(false)} className="absolute -top-10 right-0 text-white text-2xl">Close ✕</button>
            <GamesHub />
          </div>
        </div>
      )}

      {showRatingPopup && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl text-center w-80 shadow-2xl">
            <h3 className="font-bold mb-4">Rate Your Meal! ⭐</h3>
            <button onClick={submitRatings} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold mt-4">Submit</button>
          </div>
        </div>
      )}

      <style>{`
        .perspective { perspective: 1200px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
}

export default CustomerMenu;