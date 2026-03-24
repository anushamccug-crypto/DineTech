import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService"; // Ensure this path is correct

function CustomerMenu() {
  // ================= API CONFIG =================
  const API_BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://dine-tech-iyqs.vercel.app";; // Update this with your actual Vercel URL

  // ================= STATES =================
  const [dishes, setDishes] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [filter, setFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("Chef’s Signature Specials");
  const [selectedAllergy, setSelectedAllergy] = useState("");
  const [proteinPriority, setProteinPriority] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [flippedCard, setFlippedCard] = useState(null);

  // --- LOGIN MODAL STATES ---
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [localRatings, setLocalRatings] = useState({});
  const navigate = useNavigate();

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dishRes = await axios.get(`${API_BASE_URL}/api/dishes`);
        const inventoryRes = await axios.get(`${API_BASE_URL}/api/inventory`);
        setDishes(dishRes.data);
        setInventory(inventoryRes.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, [API_BASE_URL]);

  useEffect(() => {
    const storedRatings = JSON.parse(localStorage.getItem("dishRatings")) || {};
    setLocalRatings(storedRatings);
  }, []);

  // ================= SAVE CART =================
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ================= LOGIN LOGIC =================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginMessage("");
    try {
      const data = await loginUser({ email: loginEmail, password: loginPassword });
      if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "kitchen") {
        navigate("/kitchen-home");
      }
    } catch (error) {
      setLoginMessage("Invalid credentials");
    }
  };

  // ================= ALLERGY MAP =================
  const allergyMap = {
    DAIRY: ["Milk", "Butter", "Cheese", "Paneer", "Cream", "Yogurt", "Milk Solids"],
    NUTS: ["Peanut", "Almond", "Cashew"],
    GLUTEN: ["Wheat Flour", "Flour", "Bread", "Gluten", "Maida"],
    FISH: ["Seer Fish", "Fish"],
  };

  const isDishAvailable = (dish) => {
    if (!dish.ingredients?.length) return true;
    for (let ing of dish.ingredients) {
      const stock = inventory.find(
        (i) => i.ingredientName.toLowerCase() === ing.toLowerCase()
      );
      if (stock && stock.quantityAvailable <= 0) return false;
    }
    return true;
  };

  // ================= FILTERING & SORTING =================
  let filteredDishes = [...dishes].filter(isDishAvailable);

  if (filter === "VEG") filteredDishes = filteredDishes.filter(d => d.isVeg);
  if (filter === "NONVEG") filteredDishes = filteredDishes.filter(d => !d.isVeg);

  if (searchTerm)
    filteredDishes = filteredDishes.filter(d =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (proteinPriority) {
    filteredDishes.sort((a, b) => (b.nutrition?.protein || 0) - (a.nutrition?.protein || 0));
    filteredDishes = filteredDishes.slice(0, 25);
  } else if (categoryFilter && !searchTerm) {
    filteredDishes = filteredDishes.filter(d => d.category === categoryFilter);
  }

  if (priceSort === "LOW") filteredDishes.sort((a, b) => a.price - b.price);
  if (priceSort === "HIGH") filteredDishes.sort((a, b) => b.price - a.price);

  const isRestrictedDish = (dish) => {
    if (!selectedAllergy) return false;
    const mapped = allergyMap[selectedAllergy].map(a => a.toLowerCase().trim());
    const ingredients = (dish.ingredients || []).map(i => i.toLowerCase().trim());
    return ingredients.some(i => mapped.includes(i));
  };

  const findAlternative = (restrictedDish) => {
    const mapped = allergyMap[selectedAllergy] || [];
    return dishes.find(d => {
      if (d._id === restrictedDish._id) return false;
      if (d.category !== restrictedDish.category) return false;
      if (d.isVeg !== restrictedDish.isVeg) return false;
      if (d.ingredients?.some(i => mapped.some(m => m.toLowerCase().trim() === i.toLowerCase().trim()))) return false;
      if (!isDishAvailable(d)) return false;
      return true;
    });
  };

  const getComboSuggestion = (currentDish) => {
    return dishes.find(d =>
      d._id !== currentDish._id &&
      d.isVeg === currentDish.isVeg &&
      d.category !== currentDish.category &&
      isDishAvailable(d)
    );
  };

  const addToCart = (dish) => {
    if (isRestrictedDish(dish)) {
      alert("This item contains your selected allergen.");
      return;
    }
    const exists = cart.find(i => i.dish._id === dish._id);
    if (exists) {
      setCart(cart.map(i => i.dish._id === dish._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { dish, quantity: 1 }]);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories = [
    "Chef’s Signature Specials", "Soups", "Vegetarian Starters", "Non-Vegetarian Starters",
    "Tandoor & Grill Selection", "Vegetarian Main Course", "Non-Vegetarian Main Course",
    "Indian Breads & Flatbreads", "Rice Specialties", "Signature Biryani Collection",
    "South Indian Thali & Combos", "Desserts", "Beverages"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-100 to-blue-100 p-8 animate-fadeInPage">
      
      {/* HEADER + FILTERS */}
      <div className="sticky top-4 z-50 bg-white/40 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
            🍽 TasteCraft
          </h1>
          <p className="text-gray-600 mt-2 text-sm tracking-wide">Crafted with Passion • Served with Love</p>
        </div>

        <div className="grid md:grid-cols-6 gap-4 items-center">
          <input
            type="text"
            placeholder="🔍 Search dish..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-400 outline-none transition"
          />

          <select
            value={selectedAllergy}
            onChange={e => setSelectedAllergy(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-400 outline-none"
          >
            <option value="">No Allergy</option>
            <option value="DAIRY">Dairy</option>
            <option value="NUTS">Nuts</option>
            <option value="GLUTEN">Gluten</option>
            <option value="FISH">Fish</option>
          </select>

          <select
            value={priceSort}
            onChange={e => setPriceSort(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white/70 focus:ring-2 focus:ring-purple-400 outline-none"
          >
            <option value="">Sort by Price</option>
            <option value="LOW">Low → High</option>
            <option value="HIGH">High → Low</option>
          </select>

          <label className="flex items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={proteinPriority}
              onChange={() => setProteinPriority(!proteinPriority)}
              className="w-5 h-5 accent-purple-600"
            />
            💪 Protein
          </label>

          <button
            onClick={() => navigate("/cart")}
            className="relative px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold shadow-lg transition hover:scale-105"
          >
            🛒 Cart ({cartCount})
          </button>

          {/* STAFF LOGIN BUTTON */}
          <button
            onClick={() => setShowLogin(true)}
            className="px-6 py-3 rounded-xl border-2 border-purple-500 text-purple-700 font-bold hover:bg-purple-600 hover:text-white transition shadow-sm"
          >
            🔑 Staff
          </button>
        </div>
      </div>

      <div className="flex gap-10 pt-6 border-t border-white/30">
        {/* SIDEBAR */}
        <div className="w-72 h-[80vh] overflow-y-auto sticky top-24 bg-white/40 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl p-6 space-y-3">
          <h2 className="font-bold text-xl bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent mb-4">Categories</h2>
          {categories.map(section => (
            <button
              key={section}
              onClick={() => setCategoryFilter(section)}
              className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
              ${categoryFilter === section ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg" : "hover:bg-purple-100"}`}
            >
              {section}
            </button>
          ))}
        </div>

        {/* DISH GRID */}
        <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-3 gap-10 ">
          {filteredDishes.length === 0 && (
            <div className="col-span-full text-center text-gray-600 text-lg py-20">😔 No dishes match your filters</div>
          )}

          {filteredDishes.map((dish, index) => {
            const restricted = isRestrictedDish(dish);
            const alternative = restricted ? findAlternative(dish) : null;
            return (
              <div key={dish._id} className="perspective animate-fadeIn" style={{ animationDelay: `${index * 0.05}s` }}>
                <div
                  onClick={() => setFlippedCard(flippedCard === dish._id ? null : dish._id)}
                  className={`relative w-full h-[520px] transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${flippedCard === dish._id ? "rotate-y-180" : ""}`}
                >
                  {/* FRONT */}
                  <div className="absolute w-full h-full backface-hidden bg-white/90 rounded-3xl shadow-xl p-5 overflow-hidden">
                    <img src={dish.imageUrl} alt={dish.name} className="w-full h-52 object-cover rounded-xl" />
                    <h3 className="font-bold text-lg mt-4 text-gray-800">{dish.name}</h3>
                    <p className="text-purple-700 font-bold mt-2 text-lg">₹ {dish.price}</p>
                  </div>

                  {/* BACK */}
                  <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white/95 rounded-3xl shadow-xl p-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className={`px-2 py-1 text-xs rounded-full ${dish.isVeg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {dish.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 italic">✨ {dish.description || "Chef's special preparation."}</p>
                      
                      {restricted && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-red-600 text-xs font-bold">⚠ Contains Allergen</p>
                          {alternative && (
                            <button onClick={(e) => { e.stopPropagation(); addToCart(alternative); }} className="mt-1 text-xs text-green-600 underline">Add {alternative.name} instead?</button>
                          )}
                        </div>
                      )}

                      <div className="text-xs space-y-1">
                        <p>Protein: {dish.nutrition?.protein || 0}g</p>
                        <p>Calories: {dish.nutrition?.calories || 0}</p>
                      </div>
                    </div>
                    <button
                      disabled={restricted}
                      onClick={(e) => { e.stopPropagation(); addToCart(dish); }}
                      className={`py-3 rounded-xl font-bold transition ${restricted ? "bg-gray-300 text-white" : "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md hover:scale-105"}`}
                    >
                      {restricted ? "Restricted" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-3xl shadow-2xl w-96 relative border border-purple-100 animate-fadeIn">
            <button onClick={() => setShowLogin(false)} className="absolute top-5 right-5 text-gray-400 hover:text-purple-600 text-2xl">✖</button>
            <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent mb-8">Staff Portal</h2>
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-purple-400"
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-purple-400"
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-105 transition duration-300">
                Sign In
              </button>
              {loginMessage && <p className="text-center text-red-500 font-medium animate-pulse">{loginMessage}</p>}
            </form>
          </div>
        </div>
      )}

      {/* CSS STYLES */}
      <style>{`
        .perspective { perspective: 1200px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease forwards; }
        @keyframes fadeInPage { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeInPage { animation: fadeInPage 0.8s ease-in-out; }
      `}</style>
    </div>
  );
}

export default CustomerMenu;