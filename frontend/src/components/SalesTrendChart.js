import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function SalesTrendChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Revenue",
        data: data.map((d) => d.totalAmount),
        borderColor: "#a83aed",
        backgroundColor: "rgba(168,58,237,0.2)",
      },
    ],
  };

  return <Line data={chartData} />;
}

export default SalesTrendChart;
