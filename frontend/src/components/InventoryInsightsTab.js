import React from "react";

function InventoryInsightsTab({ data }) {
  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="font-bold text-lg mb-4">Inventory Predictions</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1">Ingredient</th>
            <th className="border px-2 py-1">Predicted Usage</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              <td className="border px-2 py-1">{item.ingredient}</td>
              <td className="border px-2 py-1">{item.predictedUsage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryInsightsTab;
