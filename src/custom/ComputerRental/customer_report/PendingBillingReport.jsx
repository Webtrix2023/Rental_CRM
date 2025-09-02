
import React, { useState, useEffect } from "react";
import { FaFileInvoiceDollar, FaSyncAlt, FaClock, FaDollarSign, FaDownload, FaPlus, FaEye, FaAtlas } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '@config';
import { fetchJson } from "@utils/fetchJson";
import { SmartSelectInput } from "@components/index";

const formatDateReadable = (dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date(); // use today if blank
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
function PendingBillingRow({ row }) {
  const productDetails = row.productDetails ;
  return (
    <tr className="bg-white even:bg-gray-50 hover:bg-blue-50 transition text-sm">
      <td className="px-3 py-2">
        {/* <input type="checkbox" /> */}
      </td>
      <td className="px-3 py-2 min-w-[170px]">
        <div className="font-medium text-gray-600">{productDetails?.product_name || '-'} {row.billing_type && (<span className="text-xs text-gray-500">{`[ ${row.billing_type} ]`}</span>)}</div>
        <div className="text-xs text-gray-500">{productDetails?.product_type || '-'} • SN: {productDetails?.product_serial_no || '-'}</div>
      </td>
      <td className="px-3 py-2 min-w-[150px]">
        <div className="font-medium text-gray-600">{row.customer_name}</div>
        <div className="text-xs text-gray-500">{'-'}</div>
      </td>
      <td className="px-3 py-2 min-w-[120px]">
        <div className="font-medium text-gray-600">{row.invoiceNumber}</div>
        <div className="text-xs text-gray-500">{row.delivery_date}</div>
      </td>
      <td className="px-3 py-2">
        <span className={`px-2 py-0.5 rounded text-xs font-medium
          ${row.row_close === "y" ? "bg-red-100 text-red-600" : ""}
          ${row.row_close === "n" ? "bg-green-100 text-green-700" : ""}
        `}>
          {row.row_close == 'n' ? 'Ongoing' : 'Returned'}
        </span>
        <div className="text-xs text-gray-500">
          {row.row_close === 'y' && row.return_date && (<span> Return Date {row.return_date} </span>)}
        </div>
      </td>
      <td className="px-3 py-2 min-w-[110px]">
        <div className="font-medium text-gray-700" >{formatDateReadable(row.deliveryDate) || '-'} To {formatDateReadable(row.returnDate) || formatDateReadable("")}</div>
        <div className="text-xs text-gray-500">{row.total_rent_days} { (row.billing_type == 'monthly' || row.billing_type == 'contract')? 'Month' : 'Days'}</div>
      </td>
      <td className="px-3 py-2 min-w-[90px] text-right">
        <span className="font-semibold">{row.revenue}</span>
        <div className={`text-xs text-gray-500`}> {row.last_bill_date && (<>
          <span className="text-xs">
            {formatDateReadable(row.last_bill_date)}
          </span>
        </>)}</div>
      </td>
    </tr>
  );
}
function SkeletonRow({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="bg-white even:bg-gray-50 hover:bg-blue-50 transition animate-pulse">
          <td className="px-3 py-2"><div className="w-4 h-4 bg-gray-200 rounded"></div></td>
          <td className="px-3 py-2 min-w-[170px]"><div className="w-32 h-4 bg-gray-200 rounded mb-2"></div><div className="w-24 h-3 bg-gray-100 rounded"></div></td>
          <td className="px-3 py-2 min-w-[150px]"><div className="w-28 h-4 bg-gray-200 rounded mb-2"></div><div className="w-20 h-3 bg-gray-100 rounded"></div></td>
          <td className="px-3 py-2 min-w-[120px]"><div className="w-24 h-4 bg-gray-200 rounded mb-2"></div><div className="w-16 h-3 bg-gray-100 rounded"></div></td>
          <td className="px-3 py-2"><div className="w-16 h-5 bg-gray-200 rounded mb-2"></div><div className="w-24 h-3 bg-gray-100 rounded"></div></td>
          <td className="px-3 py-2 min-w-[110px]"><div className="w-32 h-4 bg-gray-200 rounded mb-2"></div><div className="w-20 h-3 bg-gray-100 rounded"></div></td>
          <td className="px-3 py-2 min-w-[90px] text-right"><div className="w-16 h-4 bg-gray-200 rounded ml-auto mb-2"></div><div className="w-20 h-3 bg-gray-100 rounded ml-auto"></div></td>
        </tr>
      ))}
    </>
  );
}

export default function PendingBillingReport() {
  const navigate = useNavigate();
  const [showOnlyOverdue, setShowOnlyOverdue] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const defFilter = {
    assetType: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    customer_id: "",
    curpage: "0",
  };
  const defSummary = {
    "ongoing" : 0 ,
    "pending_amount" : 0 ,
    "returned_not_billed" : 0,
    "total_assets" : 0
  };
  const [filters, setFilters] = useState(defFilter)
  const [summary, setSummary] = useState(defSummary);

  const [page, setPage] = useState(1);
  const [paging, setPaging] = useState({
    curPage: 0,
    prevPage: 0,
    nextpage: 1,
    pageLimit: 50,
    totalRecords: 0,
  });
  const getData = async function () {
    setLoading(true);
    const res = await fetchJson(`${API_BASE_URL}/pending_bills`, {
      method: 'POST',
      body: JSON.stringify(filters)
    });
    const data = await res;
    setLoading(false);
    if (data.flag === "S") {
      setRows(res.data);
      setSummary(res.summary);
      setPaging(res.paginginfo);
    }else{
      setRows([]);
      setSummary(defSummary);
    }
  }
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const res = await getData();
      if (isMounted) { }
    })();
    return () => {
      isMounted = false;
    };
  }, [filters]);


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
          <div className="flex justify-between items-center bg-white rounded-xl border shadow-sm px-5 py-4 min-w-[160px]">
            <div>
              <div className="text-xs md:text-sm text-gray-500 font-medium">Total Assets</div>
              <div className="text-2xl font-bold text-gray-800">{summary.total_assets || 0}</div>
            </div>
            <div><FaFileInvoiceDollar className="text-blue-500 text-3xl" /></div>
          </div>

          <div className="flex justify-between items-center bg-white rounded-xl border shadow-sm px-5 py-4 min-w-[160px]">
            <div>
              <div className="text-xs md:text-sm text-gray-500 font-medium">Returned (Not Billed)</div>
              <div className="text-2xl font-bold text-gray-800">{summary.returned_not_billed || 0}</div>
            </div>
            <div><FaSyncAlt className="text-orange-500 text-3xl" /></div>
          </div>

          <div className="flex justify-between items-center bg-white rounded-xl border shadow-sm px-5 py-4 min-w-[160px]">
            <div>
              <div className="text-xs md:text-sm text-gray-500 font-medium">Ongoing</div>
              <div className="text-2xl font-bold text-gray-800">{summary.ongoing || 0}</div>
            </div>
            <div><FaClock className="text-blue-500 text-3xl" /></div>
          </div>
          <div className="flex justify-between items-center bg-white rounded-xl border shadow-sm px-5 py-4 min-w-[160px]">
            <div>
              <div className="text-xs md:text-sm text-gray-500 font-medium">Pending Amount</div>
              <div className="text-2xl font-bold text-gray-800">{summary.pending_amount || 0}</div>
            </div>
            <div><FaDollarSign className="text-yellow-500 text-3xl" /></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end mb-4">
          {/* <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium shadow">
            <FaDownload /> Export
          </button> */}
          <button className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium shadow" onClick={() => {
            navigate("/invoice-calculator");
          }} ><FaPlus /> Create Invoice</button>
        </div>

        {/* Filters */}
        <div className="bg-white border rounded-xl shadow-sm px-4 py-4 mb-5 text-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <div>
              <div className="text-xs mb-1">Customer</div>
              <div className="font-semibold text-base md:text-lg">
                <SmartSelectInput
                  id="customer" label="" value={filters.customer_id}
                  onSelect={(data) => {
                    if (data) {
                      setFilters(f => ({ ...f, customer_id: data }))
                    }
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
              <label className="text-xs mb-1">Type</label>
              <SmartSelectInput
                id="product_type" label="" value={filters?.type}
                onSelect={(data) => {
                  setFilters(f => ({ ...f, type: data }))
                }}
                onObjectSelect={()=>{}}
                config={{type: 'category',valueKey:'category_id',source: 'product_types',
                getLabel: (item) => `${item.categoryName}`,
                getValue: (item) => item.category_id,
                placeholder: 'Select Type',
                list:"categoryName,category_id",
                allowAddNew: false,preload: true,cache: true,showRecent: true}}
              />
            </div>
            {/* <select className="border rounded px-2 py-1 text-sm text-gray-700 bg-white w-full md:w-auto">
              <option>All Types</option>
            </select> */}

            {/* <select className="border rounded px-2 py-1 text-sm text-gray-700 bg-white w-full md:w-auto">
              <option>All Branches</option>
            </select> */}
            {/* <input
              type="text"
              placeholder="Search by serial, customer..."
              className="border rounded px-2 py-1 text-sm w-full md:w-56"
            /> */}
            {/* <label className="flex items-center text-sm gap-2 ml-1">
              <input
                type="checkbox"
                checked={showOnlyOverdue}
                onChange={() => setShowOnlyOverdue(!showOnlyOverdue)}
              />
              Show only overdue
            </label> */}
            {/* <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">Apply Filters</button> */}
            <button className="border px-3 py-1 mt-5 rounded text-sm text-gray-700 hover:bg-gray-50" onClick={()=>{
              setFilters({
                assetType: "",
                status: "",
                dateFrom: "",
                dateTo: "",
                customer_id: "",
              });
            }}>Reset</button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white border border-b rounded-xl shadow-sm p-0">
          {/* Bulk Actions */}
          <div className="flex flex-wrap gap-2 py-1 border-b border-gray-100 items-center">
            {/* <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" /> Select All
              <span className="font-medium text-gray-600">247 items found</span>
            </label> */}
            {/* <div className="flex-1" /> */}
            {/* <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
              Bulk Invoice
            </button> */}
            {/* <button className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800 text-sm">
              Send Reminder
            </button> */}
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
                  <th className="px-3 py-2 w-5 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Rental Period</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  {/* <th className="px-3 py-2 text-center">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                { loading ? (
                  <>
                    <SkeletonRow />
                  </>
                  ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No data found
                    </td>
                  </tr>
                  ) : !loading &&  rows.map((row) => (
                  <PendingBillingRow row={row} key={row.id} />
                )) 
                }
              </tbody>
            </table>
          </div>
          {/* Results */}
          <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t bg-gray-50 rounded-b-xl">
            <span>
              Showing {paging.start + 1} -{" "}
              {Math.min(paging.end, paging.totalRecords)} of {paging.totalRecords} items
            </span>
            <div className="flex gap-2">
              <button
                disabled={paging.curPage === 0}
                onClick={() => setFilters(f => ({ ...f, curpage: paging.curPage - 1 }))}
                className={`px-3 py-1 rounded border text-sm ${paging.curPage === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white hover:bg-gray-100 text-gray-700"
                  }`}
              >
                Previous
              </button>
              <button
                disabled={(paging.curPage + 1) * paging.pageLimit >= paging.totalRecords}
                onClick={() => setFilters(f => ({ ...f, curpage: paging.curPage + 1}))}
                className={`px-3 py-1 rounded border text-sm ${(paging.curPage + 1) * paging.pageLimit >= paging.totalRecords
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100 text-gray-700"
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
