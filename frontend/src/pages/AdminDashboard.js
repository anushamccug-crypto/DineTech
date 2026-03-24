import React, { useState } from "react";
import DashboardAnalytics from "./DashboardAnalytics";
import InventorySection from "./InventorySection";
import KitchenSection from "./KitchenSection";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-[#FDF8F2] text-[#5D534A]">
      {/* NAVBAR - Original Structure with New Colors */}
      <nav className="bg-[#5D534A] text-[#FDF8F2] p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold tracking-tight">
          TASTE <span className="text-[#D4A373]">CRAFTS</span> Admin
        </h1>

        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "dashboard" ? "bg-[#D4A373] text-[#5D534A]" : "hover:bg-white/10"
            }`}
          >
            Dashboard
          </button>

          <button 
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "inventory" ? "bg-[#D4A373] text-[#5D534A]" : "hover:bg-white/10"
            }`}
          >
            Inventory
          </button>

          <button 
            onClick={() => setActiveTab("kitchen")}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === "kitchen" ? "bg-[#D4A373] text-[#5D534A]" : "hover:bg-white/10"
            }`}
          >
            Kitchen
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="p-6 max-w-7xl mx-auto">
        {activeTab === "dashboard" && <DashboardAnalytics />}
        {activeTab === "inventory" && <InventorySection />}
        {activeTab === "kitchen" && <KitchenSection />}
      </div>
    </div>
  );
}

export default AdminDashboard;