import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const navigate = useNavigate();

  // Load cart
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  // Sync cart
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addQty = (dish) => {
    setCart(
      cart.map((i) =>
        i.dish._id === dish._id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  };

  const decreaseQty = (id) => {
    setCart(
      cart
        .map((i) =>
          i.dish._id === id
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter((i) => i.dish._id !== id));
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );

  const proceedToBill = () => {
    if (!customerName.trim()) {
      alert("Enter customer name");
      return;
    }

    if (!tableNumber || tableNumber < 1 || tableNumber > 30) {
      alert("Enter a valid table number (1–30)");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    const cleanCart = cart.map((i) => ({
      dishId: i.dish._id,
      name: i.dish.name,
      price: i.dish.price,
      quantity: i.quantity,
    }));

    localStorage.setItem("pendingCustomer", customerName);
    localStorage.setItem("pendingTable", String(tableNumber));
    localStorage.setItem("pendingCart", JSON.stringify(cleanCart));
    localStorage.setItem("pendingTotal", totalPrice);

    setCart([]);
    setCustomerName("");
    setTableNumber("");
    localStorage.removeItem("cart");

    navigate("/bill");
  };

  return (
    <div className="min-h-screen bg-[#FDF8F2] flex items-center justify-center p-4">

      <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-[#5D534A]">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-serif italic text-[#5D534A]">
            Your Selection
          </h1>
        </div>

        {/* Customer Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500">
              Guest Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500">
              Table
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={tableNumber}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 1 && value <= 30) {
                  setTableNumber(value);
                } else if (e.target.value === "") {
                  setTableNumber("");
                }
              }}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="1‑30"
            />
          </div>

        </div>

        {/* Cart Items */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto mb-6">

          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                key={item.dish._id}
                className="flex justify-between items-center border p-4 rounded-xl"
              >

                <div>
                  <h3 className="font-semibold">{item.dish.name}</h3>
                  <p className="text-[#D4A373] font-bold">
                    ₹{item.dish.price}
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <button
                    onClick={() => decreaseQty(item.dish._id)}
                    className="px-2 font-bold"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => addQty(item.dish)}
                    className="px-2 font-bold"
                  >
                    +
                  </button>

                </div>

                <button
                  onClick={() => removeItem(item.dish._id)}
                  className="text-red-500"
                >
                  ✕
                </button>

              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">
              Your cart is empty
            </p>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#5D534A] text-white p-6 rounded-2xl">

          <div className="flex justify-between mb-4">
            <span>Total</span>
            <span className="text-xl font-bold">
              ₹{totalPrice}
            </span>
          </div>

          <div className="flex gap-3">

            <button
              onClick={() => navigate("/menu")}
              className="flex-1 border border-white rounded-lg py-2"
            >
              Back
            </button>

            <button
              onClick={proceedToBill}
              className="flex-1 bg-white text-[#5D534A] rounded-lg py-2 font-bold"
            >
              Confirm Order
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default CartPage;