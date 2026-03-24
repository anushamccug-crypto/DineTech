import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CustomerMenu() {

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

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });
  // ⭐ RATING FEATURE START
const [localRatings, setLocalRatings] = useState({});
// ⭐ RATING FEATURE END

  const navigate = useNavigate();

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dishRes = await axios.get("http://localhost:5000/api/dishes");
        const inventoryRes = await axios.get("http://localhost:5000/api/inventory");
        setDishes(dishRes.data);
        setInventory(inventoryRes.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
  }, []);

  // ⭐ RATING FEATURE START
useEffect(() => {
  const storedRatings = JSON.parse(localStorage.getItem("dishRatings")) || {};
  setLocalRatings(storedRatings);
}, []);
// ⭐ RATING FEATURE END
  // ================= SAVE CART =================
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ================= ALLERGY MAP =================
  const allergyMap = {
    DAIRY: ["Milk", "Butter", "Cheese", "Paneer", "Cream","Yogurt","Milk Solids"],
    NUTS: ["Peanut", "Almond", "Cashew"],
    GLUTEN: ["Wheat Flour", "Flour", "Bread", "Gluten","Maida"],
    FISH: ["Seer Fish","Fish"],
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

  // ================= FILTERING =================
  let filteredDishes = [...dishes];

  filteredDishes = filteredDishes.filter(isDishAvailable);

  if (filter === "VEG") filteredDishes = filteredDishes.filter(d => d.isVeg);
  if (filter === "NONVEG") filteredDishes = filteredDishes.filter(d => !d.isVeg);

  if (searchTerm)
    filteredDishes = filteredDishes.filter(d =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // ================= PROTEIN PRIORITY =================
  if (proteinPriority) {
    // Sort all available dishes by protein across entire menu
    filteredDishes.sort(
      (a, b) => (b.nutrition?.protein || 0) - (a.nutrition?.protein || 0)
    );

    // Optional: show only top protein dish(s)
    // Sort by protein descending (already done)
filteredDishes.sort((a, b) => (b.nutrition?.protein || 0) - (a.nutrition?.protein || 0));

// Take top 10–15 dishes
filteredDishes = filteredDishes.slice(0, 25);
  } else if (categoryFilter && !searchTerm) {
    // Apply category filter only when Protein Priority is OFF
    filteredDishes = filteredDishes.filter(d => d.category === categoryFilter);
  }

  if (priceSort === "LOW")
    filteredDishes.sort((a, b) => a.price - b.price);

  if (priceSort === "HIGH")
    filteredDishes.sort((a, b) => b.price - a.price);

  const isRestrictedDish = (dish) => {
    if (!selectedAllergy) return false;

    const mapped = allergyMap[selectedAllergy].map(a =>
      a.toLowerCase().trim()
    );

    const ingredients = (dish.ingredients || []).map(i =>
      i.toLowerCase().trim()
    );

    return ingredients.some(i => mapped.includes(i));
  };

  const findAlternative = (restrictedDish) => {
    const mapped = allergyMap[selectedAllergy] || [];
    return dishes.find(d => {
      if (d._id === restrictedDish._id) return false;
      if (d.category !== restrictedDish.category) return false;
      if (d.isVeg !== restrictedDish.isVeg) return false;
      if (
        d.ingredients?.some(i =>
          mapped.some(m => m.toLowerCase().trim() === i.toLowerCase().trim())
        )
      )
        return false;
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
      alert("This item contains your selected allergen and cannot be added.");
      return;
    }

    const exists = cart.find(i => i.dish._id === dish._id);
    if (exists) {
      setCart(cart.map(i =>
        i.dish._id === dish._id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { dish, quantity: 1 }]);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories = [
    "Chef’s Signature Specials",
    "Soups",
    "Vegetarian Starters",
    "Non-Vegetarian Starters",
    "Tandoor & Grill Selection",
    "Vegetarian Main Course",
    "Non-Vegetarian Main Course",
    "Indian Breads & Flatbreads",
    "Rice Specialties",
    "Signature Biryani Collection",
    "South Indian Thali & Combos",
    "Desserts",
    "Beverages"
  ];

  // ================= UI =================
  return (
  <div className="min-h-screen bg-gradient-to-br from-rose-100 via-purple-100 to-blue-100 p-8 animate-fadeInPage">

    {/* SINGLE GLASS CONTAINER (HEADER + FILTER) */}
    <div className="sticky top-4 z-50 bg-white/40 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl p-6 space-y-6">

      {/* HEADER */}
      <div className="text-center">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
          🍽 TasteCraft
        </h1>

        <p className="text-gray-600 mt-2 text-sm tracking-wide">
          Crafted with Passion • Served with Love
        </p>
      </div>

      {/* FILTER + CART */}
      <div className="grid md:grid-cols-5 gap-6 items-center">

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
          💪 Protein Priority
        </label>

        <button
          onClick={() => navigate("/cart")}
          className={`relative px-6 py-3 rounded-xl shadow-lg transition-all duration-300
          ${cartCount > 0
            ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white animate-pulse"
            : "bg-gradient-to-r from-purple-600 to-pink-500 text-white"}`}
        >
          🛒 Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 py-1 rounded-full shadow">
              {cartCount}
            </span>
          )}
        </button>

      </div>
    </div>

      {/* CONTENT */}
      <div className="flex gap-10 pt-6 border-t border-white/30">

        {/* SIDEBAR */}
        <div className="w-72 h-[80vh] overflow-y-auto sticky top-24 bg-white/40 backdrop-blur-md border border-white/30 shadow-xl rounded-2xl p-6 space-y-3">
          <h2 className="font-bold text-xl bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent mb-4">
            Categories
          </h2>

          {categories.map(section => (
            <button
              key={section}
              onClick={() => setCategoryFilter(section)}
              className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
              ${categoryFilter === section
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg"
                : "hover:bg-purple-100"}`}
            >
              {section}
            </button>
          ))}
        </div>

        {/* DISH GRID */}
        <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-3 gap-10 ">

          {filteredDishes.length === 0 && (
            <div className="col-span-full text-center text-gray-600 text-lg py-20">
              😔 No dishes match your filters
            </div>
          )}

          {filteredDishes.map((dish, index) => {

            const restricted = isRestrictedDish(dish);
            const alternative = restricted ? findAlternative(dish) : null;
            const combo = getComboSuggestion(dish);

            return (
              <div key={dish._id} className="perspective animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s` }}>

                <div
                  onClick={() =>
                    setFlippedCard(
                      flippedCard === dish._id ? null : dish._id
                    )
                  }
                  className={`relative w-[320px] h-[520px] transition-transform duration-700 transform-style-preserve-3d cursor-pointer
                  ${flippedCard === dish._id ? "rotate-y-180" : ""}`}
                >

                  {/* FRONT */}
                  <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-rose-100 via-purple-100 to-blue-100 rounded-3xl shadow-xl overfow-hidden p-5 transition-all duration-300 hover:shadow-purple-300/50 hover:shadow-2xl hover:-translate-y-2">
                  <img
  src={dish.imageUrl || ""}
  alt={dish.name}
  loading="lazy"
  className="w-full h-52 object-cover"
  onError={(e) => {
    e.target.src =
      "https://dummyimage.com/400x250/cccccc/000000&text=No+Image";
  }}
/>

                    <h3 className="font-bold text-lg mt-4 text-gray-800">
                      {dish.name}
                    </h3>

                    <p className="text-purple-700 font-bold mt-2 text-lg">
                      ₹ {dish.price}
                    </p>

                  </div>

                 {/* BACK */}
 <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-rose-100 via-purple-100 to-blue-100 rounded-3xl shadow-xl p-6 flex flex-col justify-between">

  {/* TOP CONTENT */}
  <div className="space-y-4">

    {/* Veg / Non Veg + Rating */}
    <div className="flex justify-between items-center">
      <span className={`px-3 py-1 text-xs rounded-full font-semibold
        ${dish.isVeg 
          ? "bg-green-100 text-green-700" 
          : "bg-red-100 text-red-700"}`}>
        {dish.isVeg ? "🟢 Veg" : "🔴 Non Veg"}
      </span>

     {(() => {

  const backendRating = dish.rating || 0;
  const backendUsers = dish.numRatings || 0;

  const userRating = localRatings[dish.name];

  if (userRating) {

    const newUsers = backendUsers + 1;

    const newAvg =
      ((backendRating * backendUsers) + userRating) / newUsers;

    return (
      <>
        <span className="text-yellow-500">
          {"⭐".repeat(Math.round(newAvg))}
        </span>
        <span className="text-gray-600 text-xs">
          ({newUsers} users)
        </span>
      </>
    );
  }

  if (backendUsers > 0) {
    return (
      <>
        <span className="text-yellow-500">
          {"⭐".repeat(Math.round(backendRating))}
        </span>
        <span className="text-gray-600 text-xs">
          ({backendUsers} users)
        </span>
      </>
    );
  }

  return (
    <span className="text-gray-500 text-xs">No ratings yet</span>
  );

})()}
    </div>

    {/* Description */}
  <p className="text-sm text-gray-700 leading-relaxed font-medium">
  {dish.description 
    ? `✨ ${dish.description}` 
    : `🔥 A customer favourite loved for its bold flavours, rich texture and irresistible aroma. One bite and you're hooked!`}
</p>
    {/* Recommendation Section */}
{restricted && (
  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm">

    <p className="text-red-600 font-medium">
      ⚠ Contains your selected allergen
    </p>

    {alternative && (
      <div className="mt-2 bg-white rounded-lg p-3 shadow-sm">
        <p className="text-green-600 font-semibold text-xs">
          🧠 Recommended for you:
        </p>
        <p className="font-medium text-gray-800">
          {alternative.name}
        </p>

        <button
  onClick={(e) => {
    e.stopPropagation();

    if (!alternative) {
      alert("No alternative dish available.");
      return;
    }

    addToCart({ ...alternative });

  }}
  className="mt-2 text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
>
  Add Suggested Instead
</button>
      </div>
    )}

  </div>
)}

    {/* Nutrition */}
    <div className="space-y-2 text-xs">

      {/* Protein */}
      <div>
        <div className="flex justify-between">
          <span>Protein</span>
          <span>{dish.nutrition?.protein || 0}g</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div
            className="bg-purple-600 h-1.5 rounded-full"
            style={{ width: `${Math.min((dish.nutrition?.protein || 0) * 5, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Calories */}
      <div>
        <div className="flex justify-between">
          <span>Calories</span>
          <span>{dish.nutrition?.calories || 120}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div
            className="bg-pink-500 h-1.5 rounded-full"
            style={{ width: `${Math.min((dish.nutrition?.calories || 120) / 5, 100)}%` }}
          ></div>
        </div>
      </div>

    </div>

    {/* Ingredients */}
    <div className="flex flex-wrap gap-2">
      {dish.ingredients?.slice(0, 4).map((ing, i) => (
        <span
          key={i}
          className="bg-white text-gray-700 text-xs px-3 py-1 rounded-full shadow-sm"
        >
          {ing}
        </span>
      ))}
    </div>

  </div>

  {/* ADD TO CART BUTTON */}
  <button
    disabled={restricted}
    onClick={(e) => {
      e.stopPropagation();
      addToCart(dish);
    }}
    className={`py-3 rounded-xl font-semibold transition-all duration-300 mt-4
      ${restricted
        ? "bg-gray-400 cursor-not-allowed text-white"
        : "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:scale-105 shadow-md"}`}
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

      {/* CSS */}
      <style>{`
        .perspective { perspective: 1200px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }

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

export default CustomerMenu;
