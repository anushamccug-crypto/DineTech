import React, { useEffect, useState } from "react";
import axios from "axios";

function InventorySection() {
  const [inventory, setInventory] = useState([]);

  // Fetch inventory
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/inventory");
        setInventory(res.data);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      }
    };
    fetchInventory();
  }, []);

  // Handle input change
  const handleQuantityChange = (id, newQuantity) => {
    setInventory((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantityAvailable: Number(newQuantity) } : item
      )
    );
  };

  // Update inventory API
  const updateInventory = async (id, quantityAvailable) => {
    try {
      await axios.put(`http://localhost:5000/api/inventory/${id}`, {
        quantityAvailable,
      });
      alert("✅ Inventory updated successfully");
    } catch (err) {
      console.error("Error updating inventory:", err);
      alert("❌ Failed to update inventory");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">📦 Inventory</h2>

      <div className="p-4 bg-white shadow rounded">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-2 py-1">Ingredient</th>
              <th className="border px-2 py-1">Current Stock</th>
              <th className="border px-2 py-1">Update</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item._id}>
                <td className="border px-2 py-1">{item.ingredientName}</td>
                <td className="border px-2 py-1">{item.quantityAvailable}</td>
                <td className="border px-2 py-1 flex items-center gap-2">
                  <input
                    type="number"
                    value={item.quantityAvailable}
                    onChange={(e) =>
                      handleQuantityChange(item._id, e.target.value)
                    }
                    className="border rounded px-2 py-1 w-20"
                  />
                  <button
                    onClick={() =>
                      updateInventory(item._id, item.quantityAvailable)
                    }
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventorySection;
