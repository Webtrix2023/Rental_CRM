import React from "react";

export default function AnalyticsTrends({ rentalTrends, inventoryAging, rentalDurations }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 mb-4 border w-full">
      <h2 className="text-lg font-bold mb-4">Analytics & Trends</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div>
          <div className="font-semibold mb-1">Rental Trends</div>
          <ul>
            {rentalTrends.map((item, i) => (
              <li key={i} className="flex justify-between w-full max-w-[180px] sm:max-w-full">
                <span>{item.month}</span>
                <span>{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-1">Idle Inventory (&gt;30 days)</div>
          <ul>
            {inventoryAging.map((item, i) => (
              <li key={i} className="flex justify-between w-full max-w-[180px] sm:max-w-full">
                <span>{item.name}</span>
                <span>{item.days}d</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-1">Rental Durations</div>
          <ul>
            {rentalDurations.map((item, i) => (
              <li key={i} className="flex justify-between w-full max-w-[180px] sm:max-w-full">
                <span>{item.duration}</span>
                <span>{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
