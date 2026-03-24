import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://dine-tech-iyqs.vercel.app";

function InventorySection() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/inventory`);
        setInventory(res.data);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      }
    };
    fetchInventory();
  }, []);

  const handleQuantityChange = (id, newQuantity) => {
    setInventory((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantityAvailable: Number(newQuantity) } : item
      )
    );
  };

  const updateInventory = async (id, quantityAvailable) => {
    try {
      await axios.put(`${API_BASE_URL}/api/inventory/${id}`, {
        quantityAvailable,
      });
      alert("✅ Inventory updated successfully");
    } catch (err) {
      console.error("Error updating inventory:", err);
      alert("❌ Failed to update inventory");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#5D534A]">📦 Inventory Management</h2>
        <p className="text-xs font-bold text-[#D4A373] uppercase tracking-widest">Stock Control</p>
      </div>

      <div className="bg-white/60 backdrop-blur-sm shadow-sm rounded-2xl border border-[#5D534A]/5 overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#5D534A] text-[#FDF8F2] text-left">
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Ingredient</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-center">Update Quantity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#5D534A]/5">
            {inventory.map((item) => (
              <tr key={item._id} className="hover:bg-[#FDF8F2] transition-colors group">
                <td className="px-6 py-5 text-[#5D534A] font-bold">
                  {item.ingredientName}
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    item.quantityAvailable < 10 
                      ? "bg-[#FFF0F0] text-[#D62828]" 
                      : "bg-[#E6F3EF] text-[#2D6A4F]"
                  }`}>
                    {item.quantityAvailable < 10 ? "Low Stock" : "In Stock"}: {item.quantityAvailable}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-center gap-3">
                    <input
                      type="number"
                      value={item.quantityAvailable}
                      onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                      className="border border-[#5D534A]/10 rounded-xl px-3 py-2 w-20 text-center font-bold text-[#5D534A] focus:ring-2 focus:ring-[#D4A373] focus:border-transparent outline-none transition-all bg-white"
                    />
                    <button
                      onClick={() => updateInventory(item._id, item.quantityAvailable)}
                      className="bg-[#5D534A] text-[#FDF8F2] px-6 py-2 rounded-xl text-xs font-bold hover:bg-[#D4A373] hover:text-[#5D534A] transition-all active:scale-95 shadow-sm"
                    >
                      UPDATE
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {inventory.length === 0 && (
          <div className="text-center py-20 bg-white/40">
            <p className="text-[#5D534A]/40 font-bold italic">No ingredients found in stock.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InventorySection;
