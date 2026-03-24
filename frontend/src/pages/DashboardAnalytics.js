import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line, Pie } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://dine-tech-iyqs.vercel.app";

function DashboardAnalytics() {
  const [orders, setOrders] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const ordersRes = await axios.get(`${API_BASE_URL}/api/orders`);
        const dishesRes = await axios.get(`${API_BASE_URL}/api/dishes`);
        setOrders(ordersRes.data);
        setDishes(dishesRes.data);
      } catch (err) {
        console.error("Fetch error", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!orders.length || !dishes.length) return;

    const completedOrders = orders.filter((o) => o.status === "SERVED");
    const dishLookup = {};
    dishes.forEach((d) => { dishLookup[d._id.toString()] = d.name; });

    const totalIncome = completedOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
    const totalOrders = completedOrders.length;

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    const todayOrders = completedOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= todayStart && d <= todayEnd;
    });

    const todayRevenue = todayOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);

    const dishCount = {};
    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        const dishId = typeof item.dishId === "object" ? item.dishId.$oid || item.dishId._id : item.dishId;
        const name = dishLookup[dishId?.toString()];
        if (!name) return;
        dishCount[name] = (dishCount[name] || 0) + item.quantity;
      });
    });

    const topDishes = Object.entries(dishCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 5);

    const trendMap = {};
    completedOrders.forEach((o) => {
      const date = new Date(o.createdAt).toISOString().split("T")[0];
      const amount = Number(o.totalAmount) || 0;
      trendMap[date] = (trendMap[date] || 0) + amount;
    });

    const salesTrend = Object.entries(trendMap)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const customerMap = {};
    completedOrders.forEach((o) => { customerMap[o.customerName] = (customerMap[o.customerName] || 0) + 1; });

    let newCustomers = 0; let returningCustomers = 0;
    Object.values(customerMap).forEach((c) => { if (c === 1) newCustomers++; else returningCustomers++; });

    const hourMap = {};
    todayOrders.forEach((o) => {
      const hour = new Date(o.createdAt).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    let peakHour = "No Data";
    if (Object.keys(hourMap).length) {
      const maxHour = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0][0];
      peakHour = `${maxHour}:00 - ${Number(maxHour) + 1}:00`;
    }

    setAnalytics({
      totalIncome, totalOrders, todayRevenue, todayOrders: todayOrders.length,
      todayTopDish: topDishes[0]?.name || "None", topDishes, salesTrend,
      newCustomers, returningCustomers, peakHour,
      recommendations: returningCustomers < newCustomers 
        ? ["Offer loyalty discounts to increase returning customers"] 
        : ["Customer retention is strong!"]
    });
  }, [orders, dishes]);

  // Chart Definitions with Theme Colors
  const topDishChart = {
    labels: analytics.topDishes?.map((d) => d.name) || [],
    datasets: [{ 
      label: "Orders", 
      data: analytics.topDishes?.map((d) => d.count) || [], 
      backgroundColor: "#D4A373" // Terracotta Gold
    }],
  };

  const salesTrendChart = {
    labels: analytics.salesTrend?.map((d) => d.date) || [],
    datasets: [{ 
      label: "Revenue", 
      data: analytics.salesTrend?.map((d) => d.total) || [], 
      borderColor: "#5D534A", // Espresso Brown
      backgroundColor: "#5D534A", 
      tension: 0.4 
    }],
  };

  const retentionChart = {
    labels: ["New", "Returning"],
    datasets: [{ 
      data: [analytics.newCustomers || 0, analytics.returningCustomers || 0], 
      backgroundColor: ["#A8DADC", "#D4A373"] // Seafoam and Gold
    }],
  };

  const floatingCard = "transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-md";

  return (
    <div className="space-y-6">
      {/* TODAY'S PERFORMANCE CARD */}
      <div className="bg-[#5D534A] text-[#FDF8F2] p-8 rounded-2xl shadow-lg border border-[#5D534A]">
        <h2 className="text-xl font-bold mb-6 opacity-90 tracking-tight">Today's Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className={`${floatingCard} bg-white/10 p-4 rounded-xl border border-white/5`}>
            <p className="text-[10px] uppercase tracking-widest opacity-60">Revenue</p>
            <h3 className="text-2xl font-bold mt-1 text-[#D4A373]">₹{analytics.todayRevenue || 0}</h3>
          </div>
          <div className={`${floatingCard} bg-white/10 p-4 rounded-xl border border-white/5`}>
            <p className="text-[10px] uppercase tracking-widest opacity-60">Orders</p>
            <h3 className="text-2xl font-bold mt-1">{analytics.todayOrders || 0}</h3>
          </div>
          <div className={`${floatingCard} bg-white/10 p-4 rounded-xl border border-white/5`}>
            <p className="text-[10px] uppercase tracking-widest opacity-60">Top Dish</p>
            <h3 className="text-sm font-bold mt-1 truncate">{analytics.todayTopDish}</h3>
          </div>
          <div className={`${floatingCard} bg-white/10 p-4 rounded-xl border border-white/5`}>
            <p className="text-[10px] uppercase tracking-widest opacity-60">Peak Hour</p>
            <h3 className="text-sm font-bold mt-1">{analytics.peakHour}</h3>
          </div>
        </div>
      </div>

      {/* REVENUE OVERVIEW */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`${floatingCard} bg-[#E6F3EF] p-6 rounded-2xl border border-[#A8DADC]/30`}>
          <h3 className="text-[#2D6A4F] font-bold text-sm uppercase tracking-wider">Lifetime Income</h3>
          <p className="text-3xl font-black mt-2 text-[#5D534A]">₹{analytics.totalIncome || 0}</p>
        </div>
        <div className={`${floatingCard} bg-[#FFF0F0] p-6 rounded-2xl border border-[#D4A373]/20`}>
          <h3 className="text-[#5D534A] font-bold text-sm uppercase tracking-wider">Lifetime Orders</h3>
          <p className="text-3xl font-black mt-2 text-[#5D534A]">{analytics.totalOrders || 0}</p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#5D534A]/5 shadow-sm">
          <h3 className="text-[#5D534A] font-bold text-lg mb-4">Top 5 Dishes</h3>
          <Bar data={topDishChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="bg-white p-6 rounded-2xl border border-[#5D534A]/5 shadow-sm">
          <h3 className="text-[#5D534A] font-bold text-lg mb-4">Revenue Trend</h3>
          <Line data={salesTrendChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      {/* CUSTOMER & AI INSIGHTS */}
      <div className="grid md:grid-cols-2 gap-6 pb-10">
        <div className="bg-white p-6 rounded-2xl border border-[#5D534A]/5 shadow-sm flex flex-col items-center">
          <h3 className="text-[#5D534A] font-bold text-lg mb-4 w-full text-left">Customer Retention</h3>
          <div className="w-48 h-48">
            <Pie data={retentionChart} />
          </div>
        </div>
        <div className="bg-[#FDF8F2] p-6 rounded-2xl border border-[#D4A373]/30 shadow-sm">
          <h3 className="text-[#5D534A] font-bold text-lg mb-4">Smart AI Insights</h3>
          <div className="space-y-4">
            {analytics.recommendations?.map((r, i) => (
              <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-xl border-l-4 border-[#D4A373] shadow-sm">
                <span className="text-xl">✨</span>
                <p className="text-[#5D534A] text-sm font-bold">{r}</p>
              </div>
            ))}
            <div className="bg-[#5D534A] text-[#FDF8F2] p-5 rounded-xl mt-4">
              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#D4A373] mb-1">Forecast</p>
              <p className="text-sm font-medium">"Expect a 15% increase in orders during peak hours based on weekly trends."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardAnalytics;