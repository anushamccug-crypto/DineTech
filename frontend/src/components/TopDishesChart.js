import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function TopDishesChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: "Orders",
        data: data.map((d) => d.count),
        backgroundColor: "#ec4899",
      },
    ],
  };

  return <Bar data={chartData} />;
}

export default TopDishesChart;
