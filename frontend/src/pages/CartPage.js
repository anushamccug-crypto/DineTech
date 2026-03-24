import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const navigate = useNavigate();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addQty = (dish) => {
    setCart(cart.map(i =>
      i.dish._id === dish._id ? { ...i, quantity: i.quantity + 1 } : i
    ));
  };

  const decreaseQty = (id) => {
    setCart(cart.map(i =>
      i.dish._id === id ? { ...i, quantity: i.quantity - 1 } : i
    ).filter(i => i.quantity > 0));
  };

  const removeItem = (id) => {
    setCart(cart.filter(i => i.dish._id !== id));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);

  const proceedToBill = () => {
    // Insights from Vercel version: Simplified validation and specific state clearing
    if (!customerName.trim()) return alert("Enter customer name");
    if (!tableNumber.trim()) return alert("Enter table number");
    if (cart.length === 0) return alert("Your cart is empty");

    // Map cart to the format expected by the backend/bill page
    const cleanCart = cart.map(i => ({
      dishId: i.dish._id,
      name: i.dish.name,
      price: i.dish.price,
      quantity: i.quantity,
    }));

    // Save to pending storage for Bill generation
    localStorage.setItem("pendingCustomer", customerName);
    localStorage.setItem("pendingTable", String(tableNumber)); 
    localStorage.setItem("pendingCart", JSON.stringify(cleanCart));
    localStorage.setItem("pendingTotal", totalPrice);

    // Reset local states
    setCart([]);
    setCustomerName("");
    setTableNumber("");
    localStorage.removeItem("cart");

    // Route to bill
    navigate("/bill");
  };

  return (
    <div className="min-h-screen bg-[#FDF8F2] relative overflow-hidden font-sans text-gray-800 p-4 flex items-center justify-center">
      
      {/* 🎨 ELEGANT AMBIENT BACKGROUND */}
      <div className="absolute top-[-10%] left-[-5%] w-[70%] h-[50%] bg-[#E6F3EF] rounded-full blur-[120px] opacity-60 z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[50%] bg-[#FFF0F0] rounded-full blur-[120px] opacity-60 z-0"></div>

      {/* 🛑 Main UI Container */}
      <div className="relative z-10 w-full max-w-2xl bg-white/80 backdrop-blur-3xl p-6 md:p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-[3px] border-[#5D534A]">
        
        {/* HEADER */}
        <div className="text-center mb-6 border-b border-[#F1E9E0] pb-4">
          <h1 className="text-3xl font-serif italic text-[#5D534A] tracking-tighter">Your Selection</h1>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#D4A373] font-black mt-1">DineTech Experience</p>
        </div>

        {/* INPUT SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-[#FAF7F2] p-5 rounded-2xl border border-[#F1E9E0]">
          <div className="md:col-span-2 group">
            <label className="text-[8px] font-black text-gray-400 uppercase ml-3 tracking-widest group-focus-within:text-[#D4A373]">Guest Name</label>
            <input
              type="text"
              placeholder="Full name"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              className="w-full bg-white border border-[#5D534A] rounded-xl px-4 py-2.5 outline-none focus:border-[#D4A373] transition-all text-sm"
            />
          </div>
          <div className="group">
            <label className="text-[8px] font-black text-gray-400 uppercase ml-3 tracking-widest group-focus-within:text-[#D4A373]">Table</label>
            <input
              type="text" 
              placeholder="00"
              value={tableNumber}
              onChange={e => setTableNumber(e.target.value)}
              className="w-full bg-white border border-[#5D534A] rounded-xl px-4 py-2.5 outline-none focus:border-[#D4A373] transition-all text-center font-bold text-sm"
            />
          </div>
        </div>

        {/* CART ITEMS */}
        <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-2 no-scrollbar mb-6">
          {cart.length > 0 ? (
            cart.map(item => (
              <div key={item.dish._id} className="flex justify-between items-center bg-[#FAF7F2] p-4 rounded-2xl border border-[#F1E9E0]">
                <div className="flex flex-col flex-1">
                  <h3 className="font-serif text-lg text-[#4A423B] leading-tight">{item.dish.name}</h3>
                  <p className="text-[#D4A373] font-bold text-sm mt-0.5">₹{item.dish.price}</p>
                </div>
                
                <div className="flex gap-3 items-center bg-white px-2 py-1.5 rounded-xl border border-[#5D534A]">
                  <button onClick={() => decreaseQty(item.dish._id)} className="w-6 h-6 flex items-center justify-center text-[#5D534A] font-bold text-sm hover:text-[#D4A373] transition-colors">-</button>
                  <span className="font-black text-[#5D534A] min-w-[15px] text-center text-sm">{item.quantity}</span>
                  <button onClick={() => addQty(item.dish)} className="w-6 h-6 flex items-center justify-center text-[#5D534A] font-bold text-sm hover:text-[#D4A373] transition-colors">+</button>
                </div>

                <button onClick={() => removeItem(item.dish._id)} className="text-[9px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest ml-4 transition-colors">✕</button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 opacity-50">
              <p className="text-[#5D534A] text-xs italic">Your cart is currently empty.</p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-[#5D534A] text-white p-6 rounded-3xl border-2 border-[#F1E9E0]">
          <div className="flex justify-between items-center mb-5 px-1">
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Total Amount</span>
            <h2 className="text-3xl font-serif italic font-bold">₹{totalPrice}</h2>
          </div>
          
          <div className="flex gap-3">
            <button 
               onClick={() => navigate("/menu")}
               className="flex-1 py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest border border-white/20 text-white/70 hover:text-white hover:border-white transition-all"
            >
              Back
            </button>
            <button 
              onClick={proceedToBill} 
              className="flex-[2] py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest bg-white text-[#5D534A] hover:bg-[#D4A373] hover:text-white transition-all shadow-lg shadow-black/10 active:scale-95"
            >
              Confirm Order
            </button>
          </div>
        </div>
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

export default CartPage;