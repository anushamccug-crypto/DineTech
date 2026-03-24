import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./layout/Layout";

// Components & Pages
import Login from "./pages/Login"; // Keeping this just in case, but "/" is now Menu
import AdminDashboard from "./pages/AdminDashboard";
import KitchenDashboard from "./pages/KitchenDashboard";
import CustomerMenu from "./pages/CustomerMenu";
import OrderSummary from "./pages/OrderSummary";
import KitchenOrders from "./pages/KitchenOrders";
import OrderStatus from "./pages/OrderStatus";
import CustomerOrders from "./pages/CustomerOrders";
import BillPage from "./pages/BillPage";
import Receipt from "./components/Receipt";
import CustomerDashboard from "./pages/CustomerDashboard";
import KitchenHome from "./pages/KitchenHome";
import CartPage from "./pages/CartPage";
import OrderHistory from "./pages/OrderHistory";

function App() {
  return (
    <Router>
      <Routes>
        
        {/* ⭐ THE NEW OPENING PAGE ⭐ */}
        {/* We move CustomerMenu to "/" so it's the first thing users see */}
        <Route path="/" element={<CustomerMenu />} />

        {/* Keeping old login path available just in case at /login */}
        <Route path="/login" element={<Login />} />

        {/* CUSTOMER DASHBOARD WITHOUT LAYOUT */}
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />

        {/* All ADMIN / KITCHEN routes inside layout */}
        <Route element={<Layout />}>

          {/* Admin & Kitchen Dashboard Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/kitchen-home" element={<KitchenHome />} />
          <Route path="/kitchen" element={<KitchenDashboard />} />
          
          {/* Menu & Cart Routes */}
          <Route path="/menu" element={<CustomerMenu />} /> {/* Also kept for direct navigation */}
          <Route path="/cart" element={<CartPage />} />
          
          {/* Order & Billing Routes */}
          <Route path="/orders-summary" element={<OrderSummary />} />
          <Route path="/order-status" element={<OrderStatus />} />
          <Route path="/kitchen-orders" element={<KitchenOrders />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/track-order" element={<CustomerOrders />} />
          <Route path="/bill" element={<BillPage />} />
          <Route path="/receipt/:billId" element={<Receipt />} />

        </Route>

      </Routes>
    </Router>
  );
}

export default App;