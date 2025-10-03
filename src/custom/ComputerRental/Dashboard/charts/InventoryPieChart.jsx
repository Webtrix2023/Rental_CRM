import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
ChartJS.register(ArcElement, Tooltip, Legend);

export default function InventoryPieChart({ available, onRent, inMaintainence, sold,damaged}) {
  const data = {
    labels: ["Available", "On Rent", "Sold", "In Maintanence", "Damaged"],
    datasets: [
      {
        data: [available, onRent, sold, inMaintainence, damaged],
        backgroundColor: [
          "#2CB95E",  // green
          "#FA8C16",  // orange
          "#FF4D4F",  // red
          "#A0A0A0",  // gray
          '#8B5CF6'   // violet
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false, // Custom legend in UI
      },
      tooltip: {
        callbacks: {
          label: ctx =>
            `${ctx.label}: ${ctx.raw}`,
        },
      },
    },
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`w-80 h-80`}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}