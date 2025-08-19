import { API_BASE_URL } from "../../../config";
import { fetchJson } from "@utils/fetchJson";
import React, { useEffect, useState } from "react";

// Helper for status color
const STATUS_STYLES = {
  Ongoing: "bg-green-50 text-green-700",
  Returned: "bg-red-50 text-red-700",
  Upgrade: "bg-orange-50 text-orange-700",
};

function StatusPill({ status }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status] || "bg-gray-100 text-gray-500"
        }`}
    >
      {status}
    </span>
  );
}

export default function CustomerEquipmentReport({ customerId, customerName }) {
  // --- State
  const [loading, setLoading] = useState(true);
  const [equipments, setEquipments] = useState([]);
  const [summary, setSummary] = useState({
    ongoing: 0,
    returned: 0,
    total: 0,
    billing: 0,
    avgDays: 0,
  });
  const [filters, setFilters] = useState({
    assetType: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });
  const [page, setPage] = useState(1);

  // --- Fetch Data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetchJson(`${API_BASE_URL}/rentalReports`, {
        method: 'POST',
        body: JSON.stringify({
          report_type: "customer_wise",
          customer_id: customerId,
          customerName: encodeURIComponent(customerName),
          curpage: String(page - 1),
        })
      }
      );
      const data = await res;

      if (data.flag === "S") {
        const delivered = data.data.filter((row) => row.action === "Delivered");
        const returned = data.data.filter((row) => row.action === "return");
        const ongoing = delivered.length;
        const ret = returned.length;
        const billing =
          delivered.reduce(
            (sum, row) => sum + Number(row.invoiceLineRate || 0),
            0
          ) || 0;
        const avgDays = delivered.reduce(
          (sum, row) => sum + parseInt(row.durationDays || 0),
          0
        );
        setSummary({
          ongoing,
          returned: ret,
          total: delivered.length + ret,
          billing,
          avgDays: delivered.length
            ? Math.round(avgDays / delivered.length)
            : 0,
        });
        const eq = data.data.map((row) => ({
          ...row,
          status:
            row.action === "Delivered"
              ? "Ongoing"
              : row.action === "return"
                ? "Returned"
                : "Ongoing",
        }));
        setEquipments(eq);
      } else {
        setEquipments([]);
        setSummary({
          ongoing: 0,
          returned: 0,
          total: 0,
          billing: 0,
          avgDays: 0,
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [customerId, customerName, page]);

  const filtered = equipments.filter((row) => {
    if (
      filters.status &&
      (filters.status === "Ongoing" || filters.status === "Returned")
    ) {
      if (row.status !== filters.status) return false;
    }
    return true;
  });

  const PAGE_SIZE = 5;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-[#f8fafc] min-h-screen p-0">
      {/* Header */}
      <div className="sticky top-9 z-20 bg-[#f8fafc] flex flex-col md:flex-row md:items-center md:justify-between px-3 md:px-8 py-6 border-b">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Customer Equipment Report</h1>
          <div className="text-gray-400 mt-1 text-base">
            Comprehensive overview of customer rental assets and billing information
          </div>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          {paged.length !== 0 && (
            <>
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold text-sm">
                ⬇️ Export Excel
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold text-sm">
                ⬇️ Export PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Customer Summary */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-5 mt-8 bg-white shadow rounded-xl px-3 md:px-8 py-4 md:py-6 text-gray-700">
        <div>
          <div className="text-xs text-gray-500">Customer Name</div>
          <div className="font-semibold text-base md:text-lg">{customerName}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Customer ID</div>
          <div className="font-semibold text-base md:text-lg">CUST-2024-001</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Total Assets</div>
          <div className="font-semibold text-base md:text-lg text-green-600">
            {summary.total} Items
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Report Generated</div>
          <div className="font-semibold text-base md:text-lg">
            {new Date().toISOString().slice(0, 10)}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 my-5 md:my-7">
        <KPIBox icon="🟩" label="Ongoing Assets" value={summary.ongoing} color="green" />
        <KPIBox icon="🔴" label="Returned Assets" value={summary.returned} color="red" />
        <KPIBox icon="💸" label="Monthly Billing" value={`₹${summary.billing.toLocaleString()}`} color="blue" />
        <KPIBox icon="🗓️" label="Avg. Rental Days" value={summary.avgDays} color="orange" />
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-2 md:gap-3 bg-white rounded-lg shadow px-3 md:px-8 py-3 md:py-4 items-start md:items-end mb-5">
        <div className="w-full md:w-auto">
          <div className="text-xs mb-1">Asset Type</div>
          <select className="ws-input form-input bg-gray-100 rounded px-3 py-2 pr-10 text-gray-600 text-sm w-full md:w-36">
            <option>All Types</option>
          </select>
        </div>
        <div className="w-full md:w-auto">
          <div className="text-xs mb-1">Status</div>
          <select
            className="ws-input form-input bg-gray-100 rounded px-3 py-2 pr-10 text-gray-600 text-sm w-full md:w-36"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Status</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Returned">Returned</option>
          </select>
        </div>
        <div className="w-full md:w-auto">
          <div className="text-xs mb-1">Date From</div>
          <input
            type="date"
            className="ws-input form-input bg-gray-100 rounded px-3 py-2 pr-10 text-gray-600 text-sm w-full md:w-36"
            value={filters.dateFrom}
            onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
          />
        </div>
        <div className="w-full md:w-auto">
          <div className="text-xs mb-1">Date To</div>
          <input
            type="date"
            className="ws-input form-input bg-gray-100 rounded px-3 py-2 pr-10 text-gray-600 text-sm w-full md:w-36"
            value={filters.dateTo}
            onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
          />
        </div>
        <button
          className="w-full md:w-auto mt-2 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold text-sm"
          onClick={e => {
            e.preventDefault();
            setPage(1);
          }}
        >
          <span className="mr-1">🔎</span>Filter
        </button>
      </div>

      {/* Equipment Table - responsive as cards on mobile */}
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow px-3 md:px-8 py-4 mb-8">
        <div className="font-semibold text-lg mb-3">Equipment Details</div>
        {/* Desktop Table */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-xs text-gray-500 font-semibold border-b">
                <th className="py-2 text-left">Asset Info</th>
                <th className="py-2 text-left">Delivery</th>
                <th className="py-2 text-left">Duration</th>
                <th className="py-2 text-left">Billing</th>
                <th className="py-2 text-left">Status</th>
                <th className="py-2 text-left">Return Info</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No data found
                  </td>
                </tr>
              ) : (
                paged.map((row, idx) => (
                  <tr key={idx} className="border-b text-sm">
                    <td className="py-3">
                      <div className="font-medium text-gray-700">
                        {row.invoiceLineNarr || "-"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {row.product_serial_no || row.serial_no || "-"}
                      </div>
                    </td>
                    <td className="py-3">
                      <div>{row.invoiceNumber || "-"}</div>
                      <div className="text-xs text-gray-400">
                        {row.date || "-"}
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        {row.durationDays
                          ? `${row.durationDays} Days`
                          : "-"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {row.durationMonths
                          ? `${row.durationMonths} Months`
                          : ""}
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        ₹
                        {row.invoiceLineRate
                          ? `${row.invoiceLineRate}/month`
                          : "-"}
                      </div>
                      <div className="text-xs text-gray-400">
                        Last: {row.last_bill_date || "-"}
                      </div>
                    </td>
                    <td className="py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="py-3">
                      {row.status === "Returned" ? (
                        <div>
                          <div>{row.return_date || "-"}</div>
                          <div className="text-xs text-red-500">
                            {row.reason || ""}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Mobile Cards */}
        <div className="md:hidden flex flex-col gap-3">
          {loading ? (
            <div className="text-center text-gray-400 py-6">Loading...</div>
          ) : paged.length === 0 ? (
            <div className="text-center text-gray-400 py-6">No data found</div>
          ) : (
            paged.map((row, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1"
              >
                <div className="font-medium text-gray-700">{row.invoiceLineNarr || "-"}</div>
                <div className="text-xs text-gray-400">
                  Serial: {row.product_serial_no || row.serial_no || "-"}
                </div>
                <div className="flex flex-wrap gap-2 text-sm mt-1">
                  <span>
                    <span className="font-medium">Delivery:</span> {row.invoiceNumber || "-"}
                  </span>
                  <span>
                    <span className="font-medium">Date:</span> {row.date || "-"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span>
                    <span className="font-medium">Duration:</span>{" "}
                    {row.durationDays ? `${row.durationDays} Days` : "-"}
                  </span>
                  <span>
                    <span className="font-medium">Billing:</span>{" "}
                    ₹{row.invoiceLineRate ? `${row.invoiceLineRate}/month` : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={row.status} />
                  {row.status === "Returned" && (
                    <span className="text-xs text-red-500 ml-2">
                      {row.return_date || "-"}
                      {row.reason ? ` (${row.reason})` : ""}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between mt-4 text-xs text-gray-500 gap-2">
          <span>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}-
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results
          </span>
          <div className="flex gap-1">
            {[...Array(Math.ceil(filtered.length / PAGE_SIZE)).keys()].map((i) => (
              <button
                key={i}
                className={`px-2 py-1 rounded ${i + 1 === page
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-100 text-blue-700"
                  }`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="max-w-5xl mx-auto text-gray-400 text-xs flex flex-col md:flex-row justify-between items-center pb-4 gap-2">
        <div>
          Report generated on {new Date().toLocaleDateString()} at{" "}
          {new Date().toLocaleTimeString()}
        </div>
        <div>
          Need help?{" "}
          <a href="mailto:support@webtrixsolutions.in" className="text-blue-500 underline">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

function KPIBox({ icon, label, value, color }) {
  const colors = {
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl shadow-sm px-2 py-4 md:px-2 md:py-5 ${colors[color]}`}
    >
      <div className="text-xl md:text-3xl mb-2">{icon}</div>
      <div className="text-lg md:text-xl font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}
