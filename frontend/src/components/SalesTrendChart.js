import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function SalesTrendChart({ data }) {
  // ✅ Safety check: If data is missing or empty, show a loading message
  if (!data || data.length === 0) {
    return <div className="text-center py-10 text-gray-500">No sales data available yet...</div>;
  }

  const chartData = {
    // ✅ Matches the .date property from your analytics logic
    labels: data.map((d) => d.date), 
    datasets: [
      {
        label: "Revenue",
        // ✅ FIXED: Changed d.totalAmount to d.total to match your trendMap logic
        data: data.map((d) => d.total), 
        borderColor: "#a83aed",
        backgroundColor: "rgba(168,58,237,0.2)",
        fill: true,
        tension: 0.4, // Makes the line smooth/curvy
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value}` // Adds the Rupee symbol to the axis
        }
      }
    }
  };

  return <Line data={chartData} options={options} />;
}

export default SalesTrendChart;