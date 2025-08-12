import React from "react";

const rankColors = ["text-blue-600", "text-teal-600", "text-orange-500"];
const bgColors = ["bg-blue-50", "bg-teal-50", "bg-orange-50"];

export default function CustomerInsights() {
  const customers = [
    {
      name: "Roger Kenter",
      photo: "https://randomuser.me/api/portraits/men/32.jpg",
      totalRevenue: 41693.34,
      orders: 241693.34,
      percent: 20.85,
      flag: "🇳🇱",
      country: "Netherlands"
    },
    {
      name: "Denys Dod",
      photo: "https://randomuser.me/api/portraits/men/44.jpg",
      totalRevenue: 39222.54,
      orders: 239222.54,
      percent: 19.61,
      flag: "🇺🇦",
      country: "Ukraine"
    },
    {
      name: "Jakob Bator",
      photo: "https://randomuser.me/api/portraits/men/54.jpg",
      totalRevenue: 36953.9,
      orders: 236953.9,
      percent: 18.48,
      flag: "🇬🇧",
      country: "United Kingdom"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full max-w-2xl border">
      <span className="text-2xl font-semibold text-gray-700 block mb-4">Top Customers</span>
      
      {/* Table Headers: Hidden on mobile */}
      <div className="hidden md:grid grid-cols-7 gap-4 text-xs font-semibold text-gray-400 px-2 pb-2">
        <div>#</div>
        <div>Photo</div>
        <div>Name</div>
        <div>Country</div>
        <div className="text-right">Revenue</div>
        <div className="text-right">Orders</div>
        <div className="text-right pr-2">%</div>
      </div>
      <div className="divide-y divide-gray-100">
        {customers.map((cust, idx) => (
          <div
            key={cust.name}
            className={`flex flex-col md:grid md:grid-cols-7 gap-2 md:gap-4 py-3 ${bgColors[idx] || ""} rounded-lg mb-2`}
          >
            <div className={`text-xl font-bold w-10 md:w-auto text-center md:text-left ${rankColors[idx] || "text-gray-400"}`}>
              #{idx + 1}
            </div>
            <div className="flex justify-center md:justify-start items-center">
              <img src={cust.photo} alt={cust.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
            </div>
            <div className="text-lg font-medium text-gray-900 text-center md:text-left">{cust.name}</div>
            <div className="text-sm text-gray-500 text-center md:text-left">
              <span className="mr-1">{cust.flag}</span>
              {cust.country}
            </div>
            <div className="text-base font-semibold text-gray-700 text-center md:text-right min-w-[80px]">
              ₹{cust.totalRevenue.toLocaleString()}
            </div>
            <div className="text-base font-semibold text-gray-700 text-center md:text-right min-w-[80px]">
              {cust.orders.toLocaleString()}
            </div>
            <div className="text-base font-semibold text-gray-700 text-center md:text-right min-w-[60px] pr-2">
              {cust.percent}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
