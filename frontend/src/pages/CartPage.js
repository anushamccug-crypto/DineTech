import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addQty = (dish) => {
    setCart(cart.map(i =>
      i.dish._id === dish._id
        ? { ...i, quantity: i.quantity + 1 }
        : i
    ));
  };

  const decreaseQty = (id) => {
    setCart(
      cart
        .map(i =>
          i.dish._id === id
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter(i => i.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter(i => i.dish._id !== id));
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.dish.price * item.quantity,
    0
  );

  const proceedToBill = () => {
    if (!customerName) return alert("Enter customer name");
    if (!cart.length) return alert("Cart is empty");

    const cleanCart = cart.map(i => ({
      dishId: i.dish._id,
      name: i.dish.name,
      price: i.dish.price,
      quantity: i.quantity,
    }));

    localStorage.setItem("pendingCustomer", customerName);
    localStorage.setItem("pendingCart", JSON.stringify(cleanCart));
    localStorage.setItem("pendingTotal", totalPrice);

    setCart([]);
    setCustomerName("");
    localStorage.removeItem("cart");

    navigate("/bill");
  };

  return (
    <div className="min-h-screen flex items-center justify-center
    bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-6">

      {/* CART CONTAINER */}
      <div className="w-full max-w-3xl bg-white p-8 rounded-3xl shadow-2xl
      animate-[float_4s_ease-in-out_infinite_alternate]">

        <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">
          🛒 Your Cart
        </h1>

        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          className="w-full px-4 py-3 mb-6 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        {cart.map(item => (
          <div
            key={item.dish._id}
            className="flex justify-between items-center bg-purple-50 p-4 mb-4 rounded-xl"
          >
            <div>
              <h3 className="font-semibold text-purple-700">
                {item.dish.name}
              </h3>
              <p className="text-gray-600">
                ₹ {item.dish.price}
              </p>
            </div>

            <div className="flex gap-2 items-center">

              <button
                onClick={() => decreaseQty(item.dish._id)}
                className="px-3 py-1 bg-purple-200 rounded-lg"
              >
                -
              </button>

              <span>{item.quantity}</span>

              <button
                onClick={() => addQty(item.dish)}
                className="px-3 py-1 bg-purple-200 rounded-lg"
              >
                +
              </button>

              <button
                onClick={() => removeItem(item.dish._id)}
                className="text-red-500 text-sm"
              >
                Remove
              </button>

            </div>
          </div>
        ))}

        <h2 className="text-xl font-bold text-right text-purple-700 mt-4">
          Total: ₹ {totalPrice}
        </h2>

        <button
          onClick={proceedToBill}
          className="w-full mt-6 py-3 rounded-xl text-white
          bg-gradient-to-r from-purple-600 to-pink-500
          hover:scale-105 transition-transform"
        >
          Proceed to Bill
        </button>

        <button
          onClick={() => navigate("/menu")}
          className="w-full mt-3 py-2 border rounded-xl"
        >
          ← Back to Menu
        </button>

      </div>

      <style>
        {`
        @keyframes float {
          from { transform: translateY(0px); }
          to { transform: translateY(-12px); }
        }
        `}
      </style>

    </div>
  );
}

export default CartPage;
