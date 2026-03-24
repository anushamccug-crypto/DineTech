import React from "react";
import KitchenInventory from "./KitchenDashboard";

function KitchenHome() {
  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        background: "#f3f4f6",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
      
      </header>

      {/* Render Kitchen Inventory only */}
      <KitchenInventory />
    </div>
  );
}

export default KitchenHome;
