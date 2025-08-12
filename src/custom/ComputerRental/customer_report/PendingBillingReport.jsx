import React, { useState } from "react";
import { FaFileInvoiceDollar, FaSyncAlt, FaClock, FaDollarSign, FaDownload, FaPlus, FaEye } from "react-icons/fa";

// Dummy data for demonstration
const dummyRows = [
  {
    id: 1,
    asset: { name: "MacBook Pro 16\"", type: "Laptop", sn: "MBP2023001" },
    customer: { company: "TechCorp Solutions", person: "John Smith" },
    deliveryInfo: { challan: "CH-2024-001", date: "Jan 15, 2024" },
    status: { label: "Returned", color: "red", detail: "Feb 20, 2024" },
    period: "Jan 15 - Feb 20",
    days: "36 days",
    amount: "$1,800",
    amountNote: "Overdue 15 days",
    amountNoteColor: "text-red-500",
  },
  {
    id: 2,
    asset: { name: "Dell XPS Desktop", type: "Desktop", sn: "DXP2023045" },
    customer: { company: "Digital Dynamics", person: "Sarah Johnson" },
    deliveryInfo: { challan: "CH-2024-089", date: "Feb 01, 2024" },
    status: { label: "Ongoing", color: "yellow", detail: "Monthly cycle" },
    period: "Feb 01 - Ongoing",
    days: "52 days",
    amount: "$2,400",
    amountNote: "Due in 8 days",
    amountNoteColor: "text-orange-500",
  },
  {
    id: 3,
    asset: { name: "Canon EOS R5", type: "Camera", sn: "CER2023078" },
    customer: { company: "Innovation Labs", person: "Mike Chen" },
    deliveryInfo: { challan: "CH-2024-156", date: "Mar 10, 2024" },
    status: { label: "Ongoing", color: "green", detail: "Weekly cycle" },
    period: "Mar 10 - Ongoing",
    days: "13 days",
    amount: "$650",
    amountNote: "Current cycle",
    amountNoteColor: "text-green-500",
  },
];

const summaryStats = [
  {
    label: "Total Assets",
    value: 247,
    icon: <FaFileInvoiceDollar className="text-blue-500 text-3xl" />,
    valueClass: "text-2xl font-bold text-gray-800",
  },
  {
    label: "Returned (Not Billed)",
    value: 89,
    icon: <FaSyncAlt className="text-red-500 text-3xl" />,
    valueClass: "text-2xl font-bold text-red-500",
  },
  {
    label: "Ongoing (Due)",
    value: 158,
    icon: <FaClock className="text-orange-500 text-3xl" />,
    valueClass: "text-2xl font-bold text-orange-500",
  },
  {
    label: "Pending Amount",
    value: "$84,750",
    icon: <FaDollarSign className="text-yellow-500 text-3xl" />,
    valueClass: "text-2xl font-bold text-yellow-500",
  },
];

function PendingBillingRow({ row }) {
  // ... (same as before)
  return (
    <tr className="bg-white even:bg-gray-50 hover:bg-blue-50 transition">
      <td className="px-3 py-2">
        <input type="checkbox" />
      </td>
      <td className="px-3 py-2 min-w-[170px]">
        <div className="font-medium">{row.asset.name}</div>
        <div className="text-xs text-gray-500">{row.asset.type} • SN: {row.asset.sn}</div>
      </td>
      <td className="px-3 py-2 min-w-[150px]">
        <div className="font-medium">{row.customer.company}</div>
        <div className="text-xs text-gray-400">{row.customer.person}</div>
      </td>
      <td className="px-3 py-2 min-w-[120px]">
        <div className="font-medium">{row.deliveryInfo.challan}</div>
        <div className="text-xs text-gray-400">{row.deliveryInfo.date}</div>
      </td>
      <td className="px-3 py-2">
        <span className={`px-2 py-0.5 rounded text-xs font-medium
          ${row.status.color === "red" ? "bg-red-100 text-red-600" : ""}
          ${row.status.color === "yellow" ? "bg-yellow-100 text-yellow-700" : ""}
          ${row.status.color === "green" ? "bg-green-100 text-green-700" : ""}
        `}>
          {row.status.label}
        </span>
        <div className="text-xs text-gray-400">{row.status.detail}</div>
      </td>
      <td className="px-3 py-2 min-w-[110px]">
        <div>{row.period}</div>
        <div className="text-xs text-gray-400">{row.days}</div>
      </td>
      <td className="px-3 py-2 min-w-[90px] text-right">
        <span className="font-semibold">{row.amount}</span>
        <div className={`text-xs ${row.amountNoteColor}`}>{row.amountNote}</div>
      </td>
      <td className="px-3 py-2 min-w-[70px] text-center">
        <button className="text-gray-600 hover:text-blue-600 mr-2">
          <FaFileInvoiceDollar />
        </button>
        <button className="text-gray-600 hover:text-blue-600">
          <FaEye />
        </button>
      </td>
    </tr>
  );
}

export default function PendingBillingReport() {
  const [showOnlyOverdue, setShowOnlyOverdue] = useState(false);

  return (
    <div className="min-h-screen bg-[#f6f7f9] py-6 px-2 md:px-8">
      {/* Heading */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-0">Pending Billing Report</h2>
        <div className="text-gray-500 mb-4 text-base md:text-sm">
          Track assets returned or ongoing that require billing action
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {summaryStats.map((stat, idx) => (
            <div key={idx}
              className="flex justify-between items-center bg-white rounded-xl border shadow-sm px-5 py-4 min-w-[160px]">
              <div>
                <div className="text-xs md:text-sm text-gray-500 font-medium">{stat.label}</div>
                <div className={stat.valueClass}>{stat.value}</div>
              </div>
              <div>{stat.icon}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end mb-4">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium shadow">
            <FaDownload /> Export
          </button>
          <button className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium shadow">
            <FaPlus /> Create Invoice
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border rounded-xl shadow-sm px-4 py-4 mb-5">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <select className="border rounded px-2 py-1 text-sm text-gray-700 bg-white w-full md:w-auto">
              <option>All Customers</option>
            </select>
            <select className="border rounded px-2 py-1 text-sm text-gray-700 bg-white w-full md:w-auto">
              <option>All Types</option>
            </select>
            <select className="border rounded px-2 py-1 text-sm text-gray-700 bg-white w-full md:w-auto">
              <option>All Status</option>
            </select>
            <select className="border rounded px-2 py-1 text-sm text-gray-700 bg-white w-full md:w-auto">
              <option>All Branches</option>
            </select>
            <input
              type="text"
              placeholder="Search by serial, customer..."
              className="border rounded px-2 py-1 text-sm w-full md:w-56"
            />
            <label className="flex items-center text-sm gap-2 ml-1">
              <input
                type="checkbox"
                checked={showOnlyOverdue}
                onChange={() => setShowOnlyOverdue(!showOnlyOverdue)}
              />
              Show only overdue
            </label>
            <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">Apply Filters</button>
            <button className="border px-3 py-1 rounded text-sm text-gray-700 hover:bg-gray-50">Reset</button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white border rounded-xl shadow-sm p-0">
          {/* Bulk Actions */}
          <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-gray-100 items-center">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" /> Select All
              <span className="font-medium text-gray-600">247 items found</span>
            </label>
            <div className="flex-1" />
            <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
              Bulk Invoice
            </button>
            <button className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800 text-sm">
              Send Reminder
            </button>
          </div>
          {/* Scrollable Table */}
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full">
              <thead className="bg-gray-50 text-gray-700 text-xs font-bold sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 w-10"></th>
                  <th className="px-3 py-2 text-left">Asset Details</th>
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-left">Delivery Info</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Rental Period</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dummyRows.map((row) => (
                  <PendingBillingRow row={row} key={row.id} />
                ))}
              </tbody>
            </table>
          </div>
          {/* Results */}
          <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t bg-gray-50 rounded-b-xl">
            <span>Showing {dummyRows.length} items</span>
            {/* Pagination if you want (currently omitted) */}
          </div>
        </div>
      </div>
    </div>
  );
}
