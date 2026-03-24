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

// ✅ Dynamic URL logic
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
        // ✅ Updated with dynamic URL
        const ordersRes = await axios.get(`${API_BASE_URL}/api/orders`);
        const dishesRes = await axios.get(`${API_BASE_URL}/api/dishes`);
        setOrders(ordersRes.data);
        setDishes(dishesRes.data);
      } catch (err) {
        console.log("Fetch error", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!orders.length || !dishes.length) return;

    const completedOrders = orders.filter((o) => o.status === "SERVED");

    const dishLookup = {};
    dishes.forEach((d) => {
      dishLookup[d._id.toString()] = d.name;
    });

    const totalIncome = completedOrders.reduce((s, o) => s + o.totalAmount, 0);
    const totalOrders = completedOrders.length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayOrders = completedOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= todayStart && d <= todayEnd;
    });

    const todayRevenue = todayOrders.reduce((s, o) => s + o.totalAmount, 0);

    const dishCount = {};
    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        const dishId =
          typeof item.dishId === "object"
            ? item.dishId.$oid || item.dishId._id
            : item.dishId;
        const name = dishLookup[dishId?.toString()];
        if (!name) return;
        dishCount[name] = (dishCount[name] || 0) + item.quantity;
      });
    });

    const topDishes = Object.entries(dishCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const todayDishMap = {};
    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        const dishId =
          typeof item.dishId === "object"
            ? item.dishId.$oid || item.dishId._id
            : item.dishId;
        const name = dishLookup[dishId?.toString()];
        if (!name) return;
        todayDishMap[name] = (todayDishMap[name] || 0) + item.quantity;
      });
    });

    const todayTopDish =
      Object.entries(todayDishMap).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "None";

    const trendMap = {};
    completedOrders.forEach((o) => {
      const date = new Date(o.createdAt).toISOString().split("T")[0];
      // ✅ Force conversion to Number to ensure Chart.js can read it
      const amount = Number(o.totalAmount) || 0; 
      trendMap[date] = (trendMap[date] || 0) + amount;
    });

    const salesTrend = Object.entries(trendMap)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const customerMap = {};
    completedOrders.forEach((o) => {
      customerMap[o.customerName] =
        (customerMap[o.customerName] || 0) + 1;
    });

    let newCustomers = 0;
    let returningCustomers = 0;
    Object.values(customerMap).forEach((c) => {
      if (c === 1) newCustomers++;
      else returningCustomers++;
    });

    const frequentCustomers = Object.entries(customerMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const demandPrediction = topDishes.map((d) => ({
      name: d.name,
      prediction: Math.round(d.count * 1.2),
    }));

    const hourMap = {};
    todayOrders.forEach((o) => {
      const hour = new Date(o.createdAt).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;
    });

    let peakHour = "No Data";
    if (Object.keys(hourMap).length) {
      const maxHour = Object.entries(hourMap)
        .sort((a, b) => b[1] - a[1])[0][0];
      peakHour = `${maxHour}:00 - ${Number(maxHour) + 1}:00`;
    }

    const recommendations = [];
    if (returningCustomers < newCustomers)
      recommendations.push(
        "Offer loyalty discounts to increase returning customers"
      );
    topDishes.forEach((d) => {
      if (d.count > 20)
        recommendations.push(`${d.name} demand is high. Prepare more.`);
    });

    setAnalytics({
      totalIncome,
      totalOrders,
      todayRevenue,
      todayOrders: todayOrders.length,
      todayTopDish,
      topDishes,
      salesTrend,
      newCustomers,
      returningCustomers,
      frequentCustomers,
      demandPrediction,
      recommendations,
      peakHour,
    });
  }, [orders, dishes]);

  const topDishChart = {
    labels: analytics.topDishes?.map((d) => d.name) || [],
    datasets: [
      {
        label: "Orders",
        data: analytics.topDishes?.map((d) => d.count) || [],
        backgroundColor: "#ec4899",
      },
    ],
  };

  const salesTrendChart = {
    labels: analytics.salesTrend?.map((d) => d.date) || [],
    datasets: [
      {
        label: "Revenue",
        data: analytics.salesTrend?.map((d) => d.total) || [],
        borderColor: "#9333ea",
        backgroundColor: "#9333ea",
        tension: 0.4,
      },
    ],
  };

  const retentionChart = {
    labels: ["New Customers", "Returning Customers"],
    datasets: [
      {
        data: [
          analytics.newCustomers || 0,
          analytics.returningCustomers || 0,
        ],
        backgroundColor: ["#22c55e", "#a855f7"],
      },
    ],
  };

  const floatingCard =
    "transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl";

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">Today's Performance</h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div className={`${floatingCard} bg-white/20 p-4 rounded-xl`}>
            <p className="text-sm opacity-90">Revenue Today</p>
            <h3 className="text-3xl font-bold mt-2">
              ₹{analytics.todayRevenue || 0}
            </h3>
          </div>
          <div className={`${floatingCard} bg-white/20 p-4 rounded-xl`}>
            <p className="text-sm opacity-90">Orders Today</p>
            <h3 className="text-3xl font-bold mt-2">
              {analytics.todayOrders || 0}
            </h3>
          </div>
          <div className={`${floatingCard} bg-white/20 p-4 rounded-xl`}>
            <p className="text-sm opacity-90">Top Dish</p>
            <h3 className="text-xl font-semibold mt-2">
              {analytics.todayTopDish}
            </h3>
          </div>
          <div className={`${floatingCard} bg-white/20 p-4 rounded-xl`}>
            <p className="text-sm opacity-90">Peak Hour</p>
            <h3 className="text-xl font-semibold mt-2">{analytics.peakHour}</h3>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className={`${floatingCard} bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl shadow-md`}>
          <h3 className="text-purple-700 font-semibold text-lg">Total Income</h3>
          <p className="text-3xl font-bold mt-3 text-gray-800">
            ₹{analytics.totalIncome || 0}
          </p>
        </div>
        <div className={`${floatingCard} bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl shadow-md`}>
          <h3 className="text-purple-700 font-semibold text-lg">Total Orders</h3>
          <p className="text-3xl font-bold mt-3 text-gray-800">
            {analytics.totalOrders || 0}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className={`${floatingCard} bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl shadow-md`}>
          <h3 className="text-purple-700 font-semibold text-lg mb-4">Top Dishes</h3>
          <Bar data={topDishChart} />
        </div>
        <div className={`${floatingCard} bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl shadow-md`}>
          <h3 className="text-purple-700 font-semibold text-lg mb-4">Sales Trend</h3>
          {/* ✅ FIXED: Corrected <Line> tag here */}
          <Line data={salesTrendChart} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className={`${floatingCard} bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl shadow-md`}>
          <h3 className="text-purple-700 font-semibold text-lg mb-4">Customer Retention</h3>
          <div className="flex justify-center">
            <div className="w-60 h-60">
              <Pie data={retentionChart} />
            </div>
          </div>
        </div>
        <div className={`${floatingCard} bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl shadow-md`}>
          <h3 className="text-purple-700 font-semibold text-lg mb-4">Frequent Customers</h3>
          <div className="space-y-3">
            {analytics.frequentCustomers?.map((c) => (
              <div key={c.name} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                <span className="text-gray-700 font-medium">👤 {c.name}</span>
                <span className="text-purple-600 font-semibold">{c.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className={`${floatingCard} bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl shadow-md`}>
          <h3 className="text-purple-700 font-semibold text-lg mb-4">Demand Prediction</h3>
          <div className="space-y-3">
            {analytics.demandPrediction?.map((d) => (
              <div key={d.name} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                <span className="text-gray-700 font-medium">{d.name}</span>
                <span className="text-pink-600 font-semibold">{d.prediction} orders</span>
              </div>
            ))}
          </div>
        </div>
        <div className={`${floatingCard} bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl shadow-md`}>
          <h3 className="text-purple-700 font-semibold text-lg mb-4">AI Insights</h3>
          <div className="space-y-3">
            {analytics.recommendations?.map((r, i) => (
              <div key={i} className="bg-white p-3 rounded-lg shadow-sm text-gray-700">
                💡 {r}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardAnalytics;