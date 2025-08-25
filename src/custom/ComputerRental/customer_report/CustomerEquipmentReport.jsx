import { SmartSelectInput } from "@components/index";
import { API_BASE_URL } from "@config";
import { fetchJson } from "@utils/fetchJson";
import { ReportExport } from "./ReportExport";
import { ActionPopup } from "./ActionPopup";
import { UpgradePopup } from "./UpgradePopup";
import { ReplaceAll, Laptop, IndianRupee, RotateCcw, CalendarDays, ArrowUpDown , BadgeInfo , ArrowUpFromLine } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";


// Helper for status color
const STATUS_STYLES = {
  Ongoing: "bg-green-50 text-green-700",
  Returned: "bg-red-50 text-red-700",
  Upgrade: "bg-orange-50 text-orange-700",
  Replaced: "bg-blue-50 text-blue-700",
  pending: "bg-yellow-50 text-white-700",
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

export default function CustomerEquipmentReport({ customer_id, customerName }) {
  // --- State
  const [loading, setLoading] = useState(true);
  const [equipments, setEquipments] = useState([]);
  const [customerId, setCustomerID] = useState(customer_id);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [action, setAction] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);

  const [summary, setSummary] = useState({
    ongoing: 0,
    replacement_pending: 0,
    returned: 0,
    replaced: 0,
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
  const [records_per_page, setRecordsPerPage] = useState(10);
  const formRef = useRef(null);

  const handleInputChange = (field, value) => {
    setCustomerID(value);
  };

  const fetchData = async function () {
    setLoading(true);
    const res = await fetchJson(`${API_BASE_URL}/rentalReports`, {
      method: 'POST',
      body: JSON.stringify({
        report_type: "customer_wise",
        customer_id: customerId,
        customerName: encodeURIComponent(customerName),
        curpage: String(page - 1),
        // action : filters.status,
        assetType: filters.assetType,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      })
    }
    );
    const data = await res;
    setRecordsPerPage(Number(data.record_per_page) || 10);
    if (data.flag === "S") {
      const returned = data.data.filter((row) => row.action === "return");
      const delivered = data.data.filter((row) => row.action === "Delivered");
      const replaced = data.data.filter((row) => row.action === "replace");
      const pending = data.data.filter((row) => row.is_replacement === "y" && row.replace_row_id === null);
      const ongoing = delivered.length;
      const ret = returned.length;
      const rep = replaced.length;
      const pen = pending.length;
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
        replaced: rep,
        replacement_pending: pen,
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
              : row.action === "replace"
                ? "Replaced"
                : "Pending",
      }));
      setEquipments(eq);
    } else {
      setEquipments([]);
      setSummary({
        ongoing: 0,
        replacement_pending: 0,
        returned: 0,
        replaced: 0,
        total: 0,
        billing: 0,
        avgDays: 0,
      });
    }
    setLoading(false);
  }
  // --- Fetch Data
  useEffect(() => {
    fetchData();
  }, [customerId, customerName, filters, page]);

  const filtered = equipments.filter((row) => {
    if (filters.status && (filters.status === "Ongoing" || filters.status === "Returned")) {
      if (row.status !== filters.status) return false;
    }
    return true;
  });

  const not_replacement = equipments.filter((row) => row.is_close === 'n' && (row.is_replacement === 'n' || row.replace_row_id !== null)  );

  const PAGE_SIZE = 5;
  const paged = filtered.slice((page - 1) * records_per_page, page * records_per_page);

  return (
    <div className="bg-[#f8fafc] min-h-screen p-0">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#f8fafc] flex flex-col md:flex-row md:items-center md:justify-between px-3 md:px-8 py-6 border-b">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Customer Equipment Report</h1>
          <div className="text-gray-400 mt-1 text-base">
            Comprehensive overview of customer rental assets and billing information
          </div>
        </div>
        <div className="">
          {paged.length !== 0 && (<ReportExport filters={filters} customerId={customerId} customerName={customerName} />)}
        </div>
      </div>

      {/* Customer Summary */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-5 mt-8 bg-white shadow rounded-xl px-3 md:px-8 py-4 md:py-6 text-gray-700">
        <div>
          <div className="text-xs mb-1">Customer</div>
          <div className="font-semibold text-base md:text-lg">
            <SmartSelectInput
              id="customer" label="" value={customerId}
              onSelect={(data) => {
                handleInputChange("customerId", data)
              }}
              onObjectSelect={() => { }}
              config={{
                type: 'customer', valueKey: 'customer_id', source: 'customer',
                getLabel: (item) => `${item.name}`,
                getValue: (item) => item.customer_id,
                placeholder: 'Select Customer',
                list: "name,customer_id",
                allowAddNew: true, preload: true, cache: true, showRecent: true
              }}
            />
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Customer ID</div>
          <div className="font-semibold text-base md:text-lg">{customerId}</div>
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
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 my-5 md:my-7">
        <KPIBox icon={<Laptop size={22} />} label="Ongoing Assets" value={summary.ongoing} color="green" />
        <KPIBox icon={<RotateCcw size={20} />} label="Returned Assets" value={summary.returned} color="red" />
        <KPIBox icon={<ReplaceAll size={20} />} label="Replaced Assets" value={summary.replaced} color="violet" />
        <KPIBox icon={<IndianRupee size={20} />} label="Pending Replaced" value={summary.replacement_pending} color="yellow" />
        <KPIBox icon={<IndianRupee size={20} />} label="Monthly Billing" value={`₹ ${summary.billing.toLocaleString()}`} color="blue" />
        <KPIBox icon={<CalendarDays size={20} />} label="Avg. Rental Days" value={summary.avgDays} color="orange" />
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-2 md:gap-3 bg-white rounded-lg shadow px-3 md:px-8 py-3 md:py-4 items-start md:items-end mb-5">
        <div className="w-full md:w-auto">
          <div className="text-xs mb-1">Asset Type</div>
          <select className="ws-input form-input bg-gray-100 rounded px-3 py-2 pr-10 text-gray-600 text-sm w-full md:w-50"
            value={filters.assetType}
            onChange={e => setFilters(f => ({ ...f, assetType: e.target.value }))}
          >
            <option>All Types</option>
            <option value="NEW">New</option>
            <option value="REPL">REPL</option>
          </select>
        </div>
        <div className="w-full md:w-auto">
          <div className="text-xs mb-1">Status</div>
          <select
            className="ws-input form-input bg-gray-100 rounded px-3 py-2 pr-10 text-gray-600 text-sm w-full md:w-50"
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
            className="ws-input form-input bg-gray-100 rounded px-3 py-2 pr-10 text-gray-600 text-sm w-full md:w-50"
            value={filters.dateFrom}
            onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
          />
        </div>
        <div className="w-full md:w-auto">
          <div className="text-xs mb-1">Date To</div>
          <input
            type="date"
            className="ws-input form-input bg-gray-100 rounded px-3 py-2 pr-10 text-gray-600 text-sm w-full md:w-50"
            value={filters.dateTo}
            onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
          />
        </div>
        {Object.values(filters).some(val => val !== "") &&
          (<button
            className="w-full md:w-auto mt-2 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold text-sm"
            onClick={e => {
              e.preventDefault();
              setFilters(
                {
                  assetType: "",
                  status: "",
                  dateFrom: "",
                  dateTo: "",
                });
              // setPage(1);
            }}
          >
            <span className="mr-1">❌</span>Clear
          </button>)}
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
                <th className="py-2 text-left">Delivery Challan No.</th>
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
                        {row.delivery_date || "-"}
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
                      {row.last_bill_date &&
                        <div className="text-xs text-gray-400">
                          Last Invoice Date : {row.last_bill_date || "-"}
                        </div>}
                    </td>
                    <td className="py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="py-3 relative">
                      {Array.isArray(row?.upgradeLines) && row.upgradeLines.length > 0 && (
                        <div className="absolute top-0 right-0">
                        <BadgeInfo size={18} color="#4d6aff" onClick={()=>{ setSelectedRow(row) ; setShowUpgradeModal(true)}} />
                      </div>
                      )}
                      {row.action === "return" ? (
                        <div>
                          <div>{row.return_date || "-"}</div>
                          <div className="text-xs text-red-500">
                            {row.reason || ""}
                          </div>
                        </div>
                      ) : row.action === "replace" ? (
                        <div>
                          <div className="text-xs text-blue-500">Replaced on: {row.return_date || "-"}</div>
                          <div className="text-xs text-gray-600">{row.reason || ""}</div>
                        </div>
                      ) : (
                        <div className="flex gap-0.5">
                          <button className={`w-full ${row.is_replacement == 'y' && !row.replace_row_id ? 'md:w-1/3' : 'md:w-1/2'} flex items-center justify-center mt-1 gap-1 bg-red-500 hover:bg-red-400 text-white px-0.5 py-1 rounded-md font-medium text-xs transition-colors duration-200`} onClick={(e) => { e.preventDefault(); setSelectedRow(row); setAction('return'); setShowReturnModal(true); }}> <RotateCcw size={14} /> Return </button>
                          <button className={`w-full ${row.is_replacement == 'y' && !row.replace_row_id ? 'md:w-1/3' : 'md:w-1/2'}  flex items-center justify-center mt-1 gap-1 bg-orange-500 hover:bg-orange-400 text-white px-0.5 py-1 rounded-md font-medium text-xs transition-colors duration-200`} onClick={(e) => { e.preventDefault(); setSelectedRow(row); setAction('upgrade'); setShowReturnModal(true); }}> <ArrowUpFromLine size={14} /> Upgrade </button>
                          {row.is_replacement == 'y' && !row.replace_row_id &&
                            <button className={`w-full md:w-1/3 flex items-center justify-center mt-1 gap-1 bg-blue-500 hover:bg-blue-400 text-white px-0.5 py-1 rounded-md font-medium text-xs transition-colors duration-200`} onClick={(e) => { e.preventDefault(); setSelectedRow(row); setAction('replace'); setShowReturnModal(true); }}> <ArrowUpDown size={14} /> Replace </button>
                          }
                        </div>
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
            Showing {Math.min((page - 1) * records_per_page + 1, filtered.length)}-
            {Math.min(page * records_per_page, filtered.length)} of {filtered.length} results
          </span>
          <div className="flex gap-1">
            {[...Array(Math.ceil(filtered.length / records_per_page)).keys()].map((i) => (
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
      <ActionPopup
        customer_id={selectedRow?.customer_id}
        invoice_id={selectedRow?.invoiceID}
        product_id={selectedRow?.invoiceLineChrgID}
        itemID={selectedRow?.itemID}
        itemRow={selectedRow}
        isOpen={showReturnModal}
        action={action}
        not_replacement={not_replacement}
        refreshCustomerReport ={fetchData}
        onClose={() => setShowReturnModal(false)}
      />
      <UpgradePopup
        itemRow={selectedRow}
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
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
    green: {
      card: "bg-white text-[#16A34A]",
      icon: "bg-green-100",
    },
    red: {
      card: "bg-white text-[#DC2626]",
      icon: "bg-red-100",
    },
    blue: {
      card: "bg-white text-[#2563EB]",
      icon: "bg-blue-100",
    },
    grey: {
      card: "bg-white text-[#6B7280]",
      icon: "bg-gray-100",
    },
    orange: {
      card: "bg-white text-[#F88320]",
      icon: "bg-orange-100",
    },
    violet: {
      card: "bg-white text-[#8B5CF6]", // Violet-500
      icon: "bg-violet-100",
    },
  };

  return (
    <div className={`flex items-center justify-between rounded-xl shadow-sm px-4 py-5 ${colors[color]?.card || colors.grey.card}`}>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
      <div className={`rounded-full p-3 text-xl ${colors[color]?.icon || colors.grey.icon}`}>
        {icon}
      </div>
    </div>
  );
}



