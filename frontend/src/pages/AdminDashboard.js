import React, { useState } from "react";
import DashboardAnalytics from "./DashboardAnalytics";
import InventorySection from "./InventorySection";
import KitchenSection from "./KitchenSection";

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

<button onClick={()=>setActiveTab("dashboard")}>
Dashboard
</button>

<button onClick={()=>setActiveTab("inventory")}>
Inventory
</button>

<button onClick={()=>setActiveTab("kitchen")}>
Kitchen
</button>

</div>

</nav>

<div className="p-6">

{activeTab === "dashboard" && <DashboardAnalytics/>}

{activeTab === "inventory" && <InventorySection/>}

{activeTab === "kitchen" && <KitchenSection/>}

</div>

</div>

);

}

export default AdminDashboard;
