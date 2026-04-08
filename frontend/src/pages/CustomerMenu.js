import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { loginUser as loginService } from "../services/authService";

// ================= VERCEL / BACKEND CONFIGURATION =================
const API_BASE = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://dine-tech-iyqs.vercel.app";

function CustomerMenu() {
  // ================= STATES =================
  const [showLogin, setShowLogin] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("Chef’s Signature Specials");
  const [selectedAllergy, setSelectedAllergy] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [flippedCard, setFlippedCard] = useState(null);
  
  // Login States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  // DSS PERSONA STATE
  const [dssPersona, setDssPersona] = useState("RECOMMENDED");
  const [targetProtein, setTargetProtein] = useState(25);
  const [targetCalories, setTargetCalories] = useState(500);

  const navigate = useNavigate();

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // ================= ALLERGY CONFIGURATION =================
  const allergyMap = {
    Dairy: ["Milk", "Butter", "Cheese", "Paneer", "Cream", "Yogurt", "Milk Solids"],
    Nuts: ["Peanut", "Almond", "Cashew"],
    Gluten: ["Wheat Flour", "Flour", "Bread", "Gluten", "Maida"],
    Fish: ["Seer Fish", "Fish"],
  };

  // ================= EFFECTS =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [d, i] = await Promise.all([
          axios.get(`${API_BASE}/api/dishes`),
          axios.get(`${API_BASE}/api/inventory`)
        ]);
        setDishes(d.data);
        setInventory(i.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ================= UTILITIES =================
  const isDishInStock = (dish) => {
    if (!dish.ingredients?.length) return true;
    return dish.ingredients.every(ing => {
      const stock = inventory.find(i => i.ingredientName.toLowerCase() === ing.toLowerCase());
      return !stock || stock.quantityAvailable > 0;
    });
  };

  const isRestrictedDish = (dish) => {
    if (!selectedAllergy) return false;
    const forbidden = allergyMap[selectedAllergy] || [];
    const itemsToCheck = [...(dish.allergens || []), ...(dish.ingredients || [])];
    return itemsToCheck.some(item => 
      forbidden.some(f => item.toLowerCase().includes(f.toLowerCase().trim()))
    );
  };

  const findAlternative = (restrictedDish) => {
    if (!selectedAllergy) return null;
    return dishes.find(d => 
      d._id !== restrictedDish._id &&
      d.category === restrictedDish.category &&
      d.isVeg === restrictedDish.isVeg &&
      !isRestrictedDish(d) &&
      isDishInStock(d)
    );
  };

  // ================= DSS ENGINE =================
  const calculateDSS = (dish) => {
    const pScore = Math.min((dish.nutrition?.protein || 0) / targetProtein, 1.2) * 45;
    const cDiff = Math.abs((dish.nutrition?.calories || 400) - targetCalories);
    const cScore = Math.max(0, 35 - (cDiff / 15));
    const popScore = (dish.rating || 0) * 10;
    const bScore = dish.price < 350 ? 30 : 10;

    let finalScore = 0;
    if (dssPersona === "HEALTHIER") finalScore = (pScore * 1.2) + (cScore * 1.2) + (popScore * 0.2);
    else if (dssPersona === "TOP-RATED") finalScore = (popScore * 1.5) + (pScore * 0.3) + (bScore * 0.2);
    else if (dssPersona === "BUDGET") finalScore = (bScore * 1.5) + (popScore * 0.5) + (pScore * 0.2);
    else finalScore = pScore + cScore + popScore + bScore;

    return Math.min(Math.round(finalScore), 100);
  };

  // ================= FILTERING & SORTING =================
  const filteredDishes = useMemo(() => {
    let res = dishes.map(d => ({
  ...d,
  dssMatch: calculateDSS(d),
  isAvailable: isDishInStock(d)
}));

    if (searchTerm) {
      res = res.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
    } else {
      res = res.filter(d => d.category === categoryFilter);
    }

    return res.sort((a, b) => b.dssMatch - a.dssMatch);
  }, [dishes, inventory, dssPersona, targetProtein, targetCalories, categoryFilter, searchTerm, selectedAllergy]);

  const addToCart = (dish) => {
    if (isRestrictedDish(dish)) {
      alert("⚠️ Allergy Alert: This item contains restricted ingredients.");
      return;
    }
    const exists = cart.find(i => i.dish._id === dish._id);
    if (exists) {
      setCart(cart.map(i => i.dish._id === dish._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { dish, quantity: 1 }]);
    }
  };

  const categories = ["Chef’s Signature Specials", "Soups", "Vegetarian Starters", "Non-Vegetarian Starters", "Tandoor & Grill Selection", "Vegetarian Main Course", "Non-Vegetarian Main Course", "Indian Breads & Flatbreads", "Rice Specialties", "Signature Biryani Collection", "South Indian Thali & Combos", "Desserts", "Beverages"];

  return (
    <div className="min-h-screen bg-[#FDF8F2] relative overflow-x-hidden font-sans text-gray-800">
      
      {/* 🔐 STAFF LOGIN OVERLAY */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#5D534A]/60 backdrop-blur-md p-4 transition-all">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button onClick={() => { setShowLogin(false); setLoginMessage(""); }} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            <div className="text-center mb-8">
              <h2 className="font-serif italic text-3xl text-[#5D534A]">Staff Portal</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-2">Internal Access Only</p>
            </div>
            <div className="space-y-4">
              <input type="email" placeholder="staff@dinetech.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-[#FAF7F2] border border-[#F1E9E0] rounded-2xl px-5 py-3 outline-none focus:border-[#D4A373]" />
              <input type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-[#FAF7F2] border border-[#F1E9E0] rounded-2xl px-5 py-3 outline-none focus:border-[#D4A373]" />
              <button onClick={async () => {
                try {
                  const data = await loginService({ email: loginEmail, password: loginPassword });
                  if (data.role === "admin") navigate("/admin");
                  else if (data.role === "kitchen") navigate("/kitchen-home");
                  setShowLogin(false);
                } catch (error) { setLoginMessage("Invalid credentials"); }
              }} className="w-full bg-[#5D534A] text-white py-4 rounded-2xl font-bold uppercase tracking-widest shadow-lg hover:bg-[#4A423B]">Login to System</button>
              {loginMessage && <p className="text-center text-xs text-red-500 font-bold uppercase">{loginMessage}</p>}
            </div>
          </div>
        </div>
      )}

      {/* 🎨 AMBIENT BACKGROUND */}
      <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[40%] bg-[#F0F4FF] rounded-full blur-[100px] opacity-40 z-0"></div>

      <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto pt-6">
        
        {/* HEADER */}
        <div className="sticky top-4 z-50 bg-white/90 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-[2rem] mb-8 overflow-hidden">
          {/* TOP ROW: Brand and Search */}
          <div className="flex flex-col lg:flex-row items-center justify-between px-6 py-3 gap-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-serif italic text-[#5D534A]">DineTech</h1>
              <div className="hidden md:block w-[1px] h-6 bg-gray-200 mx-2"></div>
              <div className="flex-1 flex items-center gap-2 bg-[#FAF7F2] px-4 py-2 rounded-2xl border border-[#F1E9E0] min-w-[200px]">
                <input type="text" placeholder="Search menu..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent text-[11px] font-medium outline-none w-full" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => setShowLogin(true)} className="text-[9px] font-bold text-gray-400 hover:text-[#5D534A] uppercase tracking-[0.2em] cursor-pointer">Staff Access</button>
              <button onClick={() => navigate("/cart")} className="bg-[#5D534A] text-white px-5 py-2.5 rounded-2xl text-[10px] font-bold shadow-lg flex items-center gap-3 active:scale-95 transition-all">
                <span className="bg-white/20 px-2 py-0.5 rounded-md">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
                <span className="uppercase tracking-widest">View Cart</span>
              </button>
            </div>
          </div>

          {/* BOTTOM ROW: Persona + Protein + Calories + Allergy */}
          <div className="px-6 py-4 flex flex-col md:flex-row items-center gap-8 bg-[#FAF7F2]/50">
            
            {/* Personas merged with sliders line */}
            <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
              {["RECOMMENDED", "HEALTHIER", "BUDGET"].map(persona => (
                <button key={persona} onClick={() => setDssPersona(persona)} className={`px-3 py-1.5 rounded-lg text-[8px] font-black tracking-widest transition-all ${dssPersona === persona ? "bg-[#5D534A] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>{persona}</button>
              ))}
            </div>

            {/* Protein Slider */}
            <div className="flex-1 w-full relative pt-1">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-black text-[#5D534A] uppercase opacity-60">Protein</span>
                <span className="text-[10px] font-bold text-[#2D6A4F]">{targetProtein}g</span>
              </div>
              <input type="range" min="0" max="100" value={targetProtein} onChange={(e) => setTargetProtein(Number(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2D6A4F]" />
            </div>

            {/* Calories Slider */}
            <div className="flex-1 w-full relative pt-1">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-black text-[#5D534A] uppercase opacity-60">Calories</span>
                <span className="text-[10px] font-bold text-[#D4A373]">{targetCalories}kcal</span>
              </div>
              <input type="range" min="100" max="1500" step="50" value={targetCalories} onChange={(e) => setTargetCalories(Number(e.target.value))} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D4A373]" />
            </div>

            {/* Allergy Select */}
            <select value={selectedAllergy} onChange={e => setSelectedAllergy(e.target.value)} className="bg-white text-[9px] font-black text-red-400 border border-red-50 rounded-xl px-4 py-2 cursor-pointer uppercase shadow-sm">
              <option value="">No Allergy</option>
              <option value="Dairy">Dairy</option>
              <option value="Nuts">Nuts</option>
              <option value="Gluten">Gluten</option>
              <option value="Fish">Fish</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* SIDEBAR */}
          <div className="w-full md:w-64 h-fit md:sticky md:top-56 bg-white/50 backdrop-blur-md rounded-[2rem] p-4 border border-white/50 space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">Menu Selection</p>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} className={`w-full text-left px-5 py-3 rounded-2xl text-[10px] font-bold tracking-widest transition-all ${categoryFilter === cat ? "bg-[#E6F3EF] text-[#2D6A4F] translate-x-1" : "text-gray-400 hover:bg-white/80"}`}>
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* MAIN GRID */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {filteredDishes.map((dish) => {
              const restricted = isRestrictedDish(dish);
              const alternative = restricted ? findAlternative(dish) : null;
              return (
                <div key={dish._id} className="perspective h-[480px]">
                  <div onClick={() => setFlippedCard(flippedCard === dish._id ? null : dish._id)} className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${flippedCard === dish._id ? "rotate-y-180" : ""}`}>
                    
                    {/* FRONT CARD */}
                    <div className="absolute w-full h-full backface-hidden bg-white rounded-[2.5rem] p-4 shadow-sm border border-[#F1E9E0] flex flex-col">
                      <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#F1E9E0]">
                        <span className="text-[10px] font-black text-[#D4A373]">{dish.dssMatch}% MATCH</span>
                      </div>
                      <div className="relative h-64 w-full overflow-hidden rounded-[2rem] mb-4">
                        <img src={dish.imageUrl} className="w-full h-full object-cover" alt={dish.name} />
                      </div>
                      <div className="px-2 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-serif text-lg text-[#4A423B] leading-tight line-clamp-1">{dish.name}</h3>
                          <span className="text-sm">{dish.isVeg ? "🌱" : "🍗"}</span>
                        </div>
                        <p className="text-[#D4A373] font-bold text-xl mb-3">₹{dish.price}</p>
                        {restricted ? (
                          <div className="bg-red-50 text-red-500 text-[9px] font-black p-2 rounded-lg text-center uppercase border border-red-100 mt-auto">⚠️ CONTAINS {selectedAllergy.toUpperCase()}</div>
                        ) : (
                          <div className="mt-auto pt-2 border-t border-gray-50 flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            <span>Tap for nutrition</span>
                            <span className="text-[#2D6A4F] bg-[#E6F3EF] px-2 py-1 rounded-md">Verified</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* BACK CARD */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#FAF7F2] rounded-[2.5rem] p-6 flex flex-col border border-[#F1E9E0]">
                      <h4 className="font-serif italic text-xl text-[#5D534A] mb-2">Details</h4>
                      <p className="text-gray-500 text-[11px] mb-6 italic line-clamp-4">"{dish.description || 'Crafted with premium ingredients.'}"</p>
                      <div className="space-y-5 mb-6">
                        <div>
                          <div className="flex justify-between text-[10px] font-black text-[#5D534A] mb-1 uppercase">
                            <span>Protein</span>
                            <span>{dish.nutrition?.protein || 0}g</span>
                          </div>
                          <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-gray-100">
                            <div className="bg-[#2D6A4F] h-full" style={{ width: `${Math.min((dish.nutrition?.protein / 60) * 100, 100)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] font-black text-[#5D534A] mb-1 uppercase">
                            <span>Calories</span>
                            <span>{dish.nutrition?.calories || 0} kcal</span>
                          </div>
                          <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-gray-100">
                            <div className="bg-[#D4A373] h-full" style={{ width: `${Math.min((dish.nutrition?.calories / 1000) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-auto space-y-2">
                        {restricted && alternative && (
                          <button onClick={(e) => { e.stopPropagation(); addToCart(alternative); }} className="w-full bg-[#E6F3EF] p-3 rounded-xl text-[9px] font-black text-[#2D6A4F] border border-[#CDE3DB]">💡 TRY: {alternative.name.toUpperCase()}</button>
                        )}
                        <button
  disabled={restricted || !dish.isAvailable}
  onClick={(e) => {
    e.stopPropagation();
    addToCart(dish);
  }}
  className={`w-full py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
    !dish.isAvailable
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : restricted
      ? "bg-gray-200 text-gray-400"
      : "bg-[#5D534A] text-white shadow-lg"
  }`}
>
  {!dish.isAvailable ? "Currently Unavailable" : restricted ? "Restricted" : "Add to Order"}
</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .perspective { perspective: 1500px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
}

export default CustomerMenu;