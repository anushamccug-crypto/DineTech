import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./layout/Layout";

import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard"; // ✅ Updated path
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

        {/* Login without layout */}
        <Route path="/" element={<Login />} />

        {/* ✅ CUSTOMER DASHBOARD WITHOUT LAYOUT */}
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />

        {/* All ADMIN / KITCHEN routes inside layout */}
        <Route element={<Layout />}>

          {/* ✅ Updated Admin Dashboard to ML-powered component */}
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/kitchen" element={<KitchenDashboard />} />
          <Route path="/menu" element={<CustomerMenu />} />
          <Route path="/orders-summary" element={<OrderSummary />} />
          <Route path="/order-status" element={<OrderStatus />} />
          <Route path="/kitchen-orders" element={<KitchenOrders />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/track-order" element={<CustomerOrders />} />
          <Route path="/bill" element={<BillPage />} />
          <Route path="/receipt/:billId" element={<Receipt />} />
          <Route path="/kitchen-home" element={<KitchenHome />} />
          <Route path="/cart" element={<CartPage />} />

        </Route>

      </Routes>
    </Router>
  );
}

export default App;


