import React from "react";
import TopDishesChart from "./TopDishesChart";
import SalesTrendChart from "./SalesTrendChart";

function OverviewTab({ data, range, setRange }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Total Income */}
      <div className="p-4 bg-white shadow rounded">
        <h2 className="font-bold text-lg">Total Income</h2>
        <p className="text-2xl mt-2">₹{data.totalIncome}</p>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="mt-2 border rounded px-2 py-1"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Total Orders */}
      <div className="p-4 bg-white shadow rounded">
        <h2 className="font-bold text-lg">Total Orders</h2>
        <p className="text-2xl mt-2">{data.totalOrders}</p>
      </div>

      {/* Top Dishes */}
      <div className="col-span-2 p-4 bg-white shadow rounded">
        <h2 className="font-bold text-lg mb-2">Top Dishes</h2>
        <TopDishesChart data={data.topDishes} />
      </div>

      {/* Sales Trend */}
      <div className="col-span-2 p-4 bg-white shadow rounded">
        <h2 className="font-bold text-lg mb-2">Sales Trend</h2>
        <SalesTrendChart data={data.salesTrend} />
      </div>
    </div>
  );
}

export default OverviewTab;
