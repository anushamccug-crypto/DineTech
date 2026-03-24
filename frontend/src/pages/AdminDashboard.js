import React, { useState } from "react";
import DashboardAnalytics from "./DashboardAnalytics";
import InventorySection from "./InventorySection";
import KitchenSection from "./KitchenSection";

// ✅ Base URL logic to be passed down or used if needed
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://dine-tech-iyqs.vercel.app";

function AdminDashboard() {

const [activeTab,setActiveTab] = useState("dashboard");

return (

<div className="min-h-screen bg-gray-100">

{/* NAVBAR */}

<nav className="bg-gradient-to-r from-purple-700 to-pink-500 text-white p-4 flex justify-between">

<h1 className="text-2xl font-bold">
Taste Crafts Admin
</h1>

<div className="space-x-4">

<button 
  className={`px-3 py-1 rounded ${activeTab === "dashboard" ? "bg-white text-purple-700 font-bold" : ""}`}
  onClick={()=>setActiveTab("dashboard")}
>
Dashboard
</button>

<button 
  className={`px-3 py-1 rounded ${activeTab === "inventory" ? "bg-white text-purple-700 font-bold" : ""}`}
  onClick={()=>setActiveTab("inventory")}
>
Inventory
</button>

<button 
  className={`px-3 py-1 rounded ${activeTab === "kitchen" ? "bg-white text-purple-700 font-bold" : ""}`}
  onClick={()=>setActiveTab("kitchen")}
>
Kitchen
</button>

</div>

</nav>

<div className="p-6">

{/* IMPORTANT: Ensure DashboardAnalytics, InventorySection, and KitchenSection 
   are updated with the API_BASE_URL constant internally!
*/}
{activeTab === "dashboard" && <DashboardAnalytics/>}

{activeTab === "inventory" && <InventorySection/>}

{activeTab === "kitchen" && <KitchenSection/>}

</div>

</div>

);

}

export default AdminDashboard;