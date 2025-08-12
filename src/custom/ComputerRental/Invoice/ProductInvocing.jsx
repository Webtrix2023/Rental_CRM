import React, { useEffect, useState } from "react";
import { Calendar, Loader, CheckSquare, Square, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { SmartSelectInput } from "@components/index";
import { API_BASE_URL } from "../../../config";
import { fetchJson } from "@utils/fetchJson";
import { toast } from "react-toastify";
// // Replace with your fetch utility or window.fetch
// const fetchJson = async (url) => {
//   const res = await fetch(url);
//   if (!res.ok) throw new Error("Network response was not ok");
//   return await res.json();
// };
function SkeletonRow() {
  return (
    <div className="flex items-center py-4 px-4 animate-pulse border rounded-lg mb-2">
      <div className="w-6 h-6 bg-gray-200 rounded mr-4" />
      <div className="flex-1">
        <div className="w-1/2 h-4 bg-gray-200 rounded mb-2" />
        <div className="w-1/3 h-3 bg-gray-100 rounded" />
      </div>
      <div className="w-24 h-5 bg-gray-100 rounded ml-2" />
    </div>
  );
}

export default function ProductInvocing() {
  // UI state
  const [invoiceDetails, setInvoiceDetails] = useState({
    customerId : null,
    invoiceDate : new Date().toISOString().substring(0, 10),
    billingDate : new Date().toISOString().substring(0, 10),
    billingPeriod : "Monthly",
    summary:{},
    selectedAssets:[],
  });
  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleInputChange = (field, value) => {
    setInvoiceDetails((prev)=>({
      ...prev,
      [field]: value,
    }));
    // setCustomerId(value);
  };
  
  // Demo summary stats
  const [summary, setSummary] = useState({
    activeAssets: 0,
    billingDays: 0,
    pendingAmount: 0,
    selectedItems: 0,
    totalAssets: 0,
    lastInvoice: null,//new Date().toISOString().substring(0, 10),//null ,"2023-12-25",
  });
  const isBillingDateValid = (billingDate) => {
    if (!billingDate) return false; // No date provided
    const billing = new Date(billingDate);
    const today = new Date();
    billing.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return billing <= today;
  };
  const getDeliveries = function () {
    if (!invoiceDetails.customerId) {
      setAssets([]);
      setSelectedAssets([]);
      return;
    }
    if (!invoiceDetails.billingDate || !isBillingDateValid(invoiceDetails.billingDate)) {
      toast.error(`Billing date cannot be in the future.`);
      return
    }
    setLoading(true);
    fetchJson(`${API_BASE_URL}/rentalgetAllLines/${invoiceDetails.customerId || 0}`, { method: "POST" ,body : JSON.stringify({billingDate : invoiceDetails.billingDate})})
      .then((res) => {
        setAssets(res.data || []);
        setSelectedAssets([]);
        setSummary((s) => ({
          ...s,
          activeAssets: res.data?.filter((a) => a.row_close !== "y").length || 0,
          totalAssets: res.data?.length || 0,
          selectedItems: 0,
        }));
      })
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  }
  // Load assets on customer select
  useEffect(() => {
    getDeliveries();
  }, [invoiceDetails]);

  // Update selectedItems in summary
  useEffect(() => {
    setSummary((s) => ({
      ...s,
      selectedItems: selectedAssets.length,
    }));
  }, [selectedAssets]);

  // const getlastInvoice = function (item) {
  //   console.log('item : ',item);
  //   const lastdate = new Date(item.deliveryDate);
  //   console.log('lastdate : ',lastdate);
    
  //   if (item.last_bill_date && summary.lastInvoice) {
  //     const lastInvoice = new Date(summary.lastInvoice);
  //     if (lastInvoice > lastdate) {
  //       setSummary((prev)=>({
  //         ...prev,
  //         ['lastInvoice'] : lastInvoice
  //       }));
  //     }
  //   }
  // };
  // SELECTED ITEMS
  const isSelected = (itemID) => selectedAssets.some((item) => item.itemID === itemID);
  const toggleSelect = (itemID) => {
    console.log('itemID',itemID);
    
    const item = assets.find((a) => a.itemID == itemID);
    if (!item) return;
    console.log('item : ', item);

    setSelectedAssets((prev) => {
      const alreadySelected = prev.some((i) => i.itemID === itemID);
      return (alreadySelected)
        ? prev.filter((i) => i.itemID !== itemID)
        : [...prev, item];
    }
    );
  };

  const selectAll = () => {
    setSelectedAssets(assets.filter(a => (!a.last_bill_date && a.row_close !== "y")).map(a => a));
    // setSelectedAssets(assets.filter(a => a.row_close !== "y").map(a => a.itemID));
  };
  const clearSelection = () => setSelectedAssets([]);

  // CALCULATION 
  console.log('selectedAssets : ',selectedAssets);
  const subtotal = selectedAssets
    // .filter((a) => isSelected(a.itemID) && a.row_close !== "y")
    // .filter((a) => isSelected(a.itemID) && (!a.last_bill_date && a.row_close !== "y"))
    .reduce((sum, a) => sum + Number(a.revenue || 0), 0);
  
  const gst = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + gst;

  // Get billing period (placeholder, can be dynamic)
  const periodStart = "Dec 26, 2023";
  const periodEnd = "Jan 25, 2024";

  const compareDate = (invoiceDate, lastBillDate) => {
    if (!lastBillDate) return false;

    const date1 = new Date(invoiceDate);
    const date2 = new Date(lastBillDate);

    if (date1 > date2) {
      console.log(`Invoice date is after last bill date: ${invoiceDate} > ${lastBillDate}`);
      return true;
    }

    if (date1 < date2) {
      console.log(`Invoice date is before last bill date: ${invoiceDate} < ${lastBillDate}`);
      return false;
    }
    console.info(`Both dates are the same: ${invoiceDate} = ${lastBillDate}`);
    return false;
  };

  // Handle save/generate
  const handleGenerateInvoice = async () => {

    if (selectedAssets.length == 0) return ;

    invoiceDetails.selectedAssets = selectedAssets ;
    invoiceDetails.summary = summary ;

    console.log('Invoice Details : ',invoiceDetails);    

    setLoading(true);
    const res = await fetchJson(`${API_BASE_URL}/rental/createInvoice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceDetails),
    });
    setLoading(false);
    if(res?.flag === "S"){
      toast.success(`Invoice Created !`);
      getDeliveries();
    }else{
      toast.error(`Error while creating invoice (${res.status})`);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-4 px-2 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Customer Invoice</h1>
          <div className="text-gray-500 text-sm">Generate monthly billing for rental equipment</div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 text-sm">
            <Loader size={16} className="mr-1" /> Invoice History
          </button>
          <button className="flex items-center bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm">
            <Plus size={16} className="mr-1" /> New Invoice
          </button>
        </div>
      </div>

      {/* Invoice Setup */}
      <div className="bg-white shadow rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold mb-1">Customer</label>
          <SmartSelectInput
            id="customer" label="" value={invoiceDetails.customerId}
            onSelect={(data) => {
              handleInputChange("customerId",data)}}
            onObjectSelect={()=>{}}
            config={{type: 'customer',valueKey:'customer_id',source: 'customer',
            getLabel: (item) => `${item.name}`,
            getValue: (item) => item.customer_id,
            placeholder: 'Select Customer',
            list:"name,customer_id",
            allowAddNew: true,preload: true,cache: true,showRecent: true}}
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold mb-1">Invoice Date</label>
          <div className="relative">
            <input
              type="date"
              value={invoiceDetails.invoiceDate}
              onChange={e => handleInputChange("invoiceDate",e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-700 pr-8 focus:outline-none"
            />
            <Calendar size={16} className="absolute top-2.5 right-2 text-gray-400" />
          </div>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold mb-1">Billing Date</label>
          <div className="relative">
            <input
              type="date"
              value={invoiceDetails.billingDate}
              onChange={e => handleInputChange("billingDate",e.target.value)}
              className="w-full border rounded px-3 py-2 text-gray-700 pr-8 focus:outline-none"
            />
            <Calendar size={16} className="absolute top-2.5 right-2 text-gray-400" />
          </div>
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold mb-1">Billing Period</label>
          <select
            value={invoiceDetails.billingPeriod}
            onChange={e => handleInputChange("billingPeriod",e.target.value)}
            className="w-full border rounded px-3 py-2 text-gray-700 focus:outline-none"
          >
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Asset Summary */}
      <div className="bg-white shadow rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[150px]">
          <div className="text-xs text-gray-500 mb-1">Active Assets</div>
          <div className="font-bold text-blue-600">{summary.activeAssets}</div>
        </div>
        <div className="flex-1 min-w-[150px]">
          <div className="text-xs text-gray-500 mb-1">Billing Days</div>
          <div className="font-bold text-green-600">{summary.billingDays}</div>
        </div>
        <div className="flex-1 min-w-[150px]">
          <div className="text-xs text-gray-500 mb-1">Pending Amount</div>
          <div className="font-bold text-orange-500">₹{summary.pendingAmount.toLocaleString()}</div>
        </div>
        <div className="flex-1 min-w-[150px]">
          <div className="text-xs text-gray-500 mb-1">Selected Items</div>
          <div className="font-bold text-purple-600">{summary.selectedItems}</div>
        </div>
        <div className="flex-1 min-w-[150px] hidden sm:block text-right text-xs text-gray-400">
          Total Assets: {summary.totalAssets} <span className="ml-4">Last Invoice: {summary.lastInvoice}</span>
        </div>
      </div>

      {/* Select Assets */}
      <div className="bg-white shadow rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold text-gray-800">Select Assets to Invoice</div>
          <div className="text-xs">
            <button onClick={selectAll} className="text-blue-500 mr-4 hover:underline">Select All</button>
            <button onClick={clearSelection} className="text-gray-400 hover:text-red-500 hover:underline">Clear Selection</button>
          </div>
        </div>
        {loading ? (
          <>
            <SkeletonRow /><SkeletonRow /><SkeletonRow />
          </>
        ) : (
          assets.length === 0 ? (
            <div className="text-gray-400 text-sm py-8 text-center">No assets available. Select a customer to load assets.</div>
          ) : (
            assets.map((a) => (
              <>
                {/* {console.log('a row_close: ',a.row_close)}
                {console.log('a last_bill_date : ',a.last_bill_date)}
                {console.log('a invoiceDate : ',invoiceDetails.invoiceDate)} */}
                {
                  compareDate(invoiceDetails.invoiceDate, a.last_bill_date)
                }
                {/* {getlastInvoice(a)} */}
                <div
                  key={a.itemID}
                  className={clsx(
                    "flex items-center border p-3 rounded-lg mb-2 hover:bg-gray-50 transition cursor-pointer",
                    (a.row_close === "y" && a.last_bill_date) && "opacity-50 pointer-events-none"
                  )}
                  onClick={() => (!a.last_bill_date || compareDate(invoiceDetails.invoiceDate, a.last_bill_date) ) && toggleSelect(a.itemID)}
                  aria-disabled={a.row_close === "y" && a.last_bill_date}
                >
                  <div className="mr-3">
                    {isSelected(a.itemID) ? (
                      <CheckSquare className="text-blue-500" size={22} />
                    ) : (
                      <Square className="text-gray-400" size={22} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{a.invoiceLineNarr || "Product"}</div>
                    <div className="text-xs text-gray-500">
                      Delivered: {a.deliveryDate ? new Date(a.deliveryDate).toLocaleDateString('en-IN') : "-"}
                      {a.challan_number && <> | Challan: {a.challan_number}</>}
                      {a.returnDate && <span className="text-red-400 ml-2">(Returned)</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Rate: ₹{a.invoiceLineRate}/month</div>
                    <div className="text-green-600 font-bold">
                      ₹{a.revenue}
                      <span className="ml-1 text-xs text-gray-500">{a.total_rent_days || 0} Days</span>
                    </div>
                  </div>
                </div>
              </>
            ))
          )
        )}
      </div>

      {/* Invoice Summary */}
      <div className="bg-white shadow rounded-xl p-4 mb-10">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="font-semibold mb-2 text-gray-800">Billing Details</div>
          <div className="text-xs mb-1">Billing Period: <span className="text-gray-700">{periodStart} - {periodEnd}</span></div>
          <div className="text-xs mb-1">Total Days: <span className="text-gray-700">{summary.billingDays}</span></div>
          <div className="text-xs mb-1">Selected Assets: <span className="text-gray-700">{selectedAssets.length}</span></div>
          <div className="text-xs mb-1">Invoice Date: <span className="text-gray-700">{invoiceDetails.invoiceDate && new Date(invoiceDetails.invoiceDate).toLocaleDateString()}</span></div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="font-semibold mb-2 text-gray-800">Amount Calculation</div>
          <div className="text-xs mb-1 flex justify-between">Subtotal: <span className="text-gray-700">₹{subtotal}</span></div>
          <div className="text-xs mb-1 flex justify-between">GST (18%): <span className="text-gray-700">₹{gst}</span></div>
          <div className="text-xs mb-1 flex justify-between">Other Charges: <span className="text-gray-700">₹0</span></div>
          <div className="text-lg font-bold mt-2 flex justify-between">Total Amount: <span className="text-green-600">₹{totalAmount}</span></div>
        </div>
      </div>
      <div className="flex bg-white flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-xs text-gray-400 flex-1">
          <span>All billing calculations are based on actual usage days</span>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-sm"
            disabled={selectedAssets.length === 0}
            onClick={() => window.alert("Preview Invoice is not implemented in this demo.")}
          >
            <Loader size={16} className="mr-1" /> Preview Invoice
          </button>
          <button
            className="flex items-center bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-sm disabled:bg-gray-200 disabled:text-gray-500"
            disabled={selectedAssets.length === 0}
            onClick={handleGenerateInvoice}
          >
            <Plus size={16} className="mr-1" /> Generate Invoice
          </button>
        </div>
      </div>
      </div>
      {/* Footer Actions */}
      
    </div>
  );
}
