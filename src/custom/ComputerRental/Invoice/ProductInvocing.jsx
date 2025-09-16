import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Calendar,
  CheckSquare,
  Square,
  Plus,
} from "lucide-react";
import clsx from "clsx";
import { SmartSelectInput } from "@components/index";
import { API_BASE_URL } from "@config";
import { fetchJson } from "@utils/fetchJson";
import { toast } from "react-toastify";
import Cookies from "js-cookie";


const swalObj = withReactContent(Swal);

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
    customerId: null,
    invoiceDate: new Date().toISOString().substring(0, 10),
    billingDate: new Date().toISOString().substring(0, 10),
    billingPeriod: "Monthly",
    is_gst_billing: "no",
    customGst: '0',
    centralGst: '0',
    stateGst: '0',
    interGst: '0',
    company_state_id: '0',
    summary: {},
    selectedAssets: [],
  });

  const [customer, setCustomer] = useState(null);
  const [assets, setAssets] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setInvoiceDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Demo summary stats
  const [summary, setSummary] = useState({
    activeAssets: 0,
    billingDays: 0,
    pendingAmount: 0,
    selectedItems: 0,
    totalAssets: 0,
    lastInvoice: null,
  });

  const isDateValid = (date) => {
    if (!date) return false;
    const d = new Date(date);
    const today = new Date();
    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return d <= today;
  };

  function isLastBillDatePassed(lastBillDateStr) {
    if (!lastBillDateStr) return false; // handle empty/null

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize today

    const lastBillDate = new Date(lastBillDateStr);
    lastBillDate.setHours(0, 0, 0, 0); // normalize input

    return lastBillDate < today; // true if passed
  }

  const canBillReturnedProduct = (invoiceDate, lastBillDate, returnDate, billing_type) => {
    const date1 = new Date(invoiceDate);
    const date2 = lastBillDate ? new Date(lastBillDate) : null;
    const returnDt = returnDate ? new Date(returnDate) : null;

    // 1. If never billed → allow once
    if (!date2) return true;

    // 2. If trying to bill after return date → not allowed
    if (returnDt && date1 > returnDt) return false;

    // 3. If trying to bill in the same month as last bill → not allowed
    if (billing_type === "monthly" || billing_type === "contract") {
      const sameMonth =
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
      if (sameMonth) return false;
    } else {
      // for daily/other billing → block same date
      if (date1.toDateString() === date2.toDateString()) return false;
    }

    // 4. If last bill was more than 2 months before return date → allow (catch-up billing)
    if (
      returnDt &&
      (returnDt.getMonth() - date2.getMonth() +
        12 * (returnDt.getFullYear() - date2.getFullYear())) >= 2
    ) {
      return true;
    }

    // 5. Otherwise, don't allow (already billed before closure)
    return false;
  };

  const formatAmount = (value) => {
    let numericValue = parseFloat(value);

    if (isNaN(numericValue)) numericValue = 0;

    return numericValue.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const compareDate = (invoiceDate, lastBillDate, billing_type) => {
    if (!lastBillDate) return true; // no last bill → billing allowed

    const date1 = new Date(invoiceDate);
    const date2 = new Date(lastBillDate);

    if (billing_type === "monthly" || billing_type === "contract") {
      const sameMonth =
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
      return !sameMonth && date1 > date2; // allow only if not same month and after last bill
    }

    // daily/other billing types
    return date1 > date2;
  };
  const isDisabled = (a) => {
    // invoiceDetails.billingDate = "2025-11-04";
    console.log('a :', a);
    if (a.row_close === "y" && !canBillReturnedProduct(invoiceDetails.billingDate, a.last_bill_date, a.returnDate, a.billing_type)) {
      return true;
    } else if (a.row_close === "n" && !compareDate(invoiceDetails.billingDate, a.last_bill_date, a.billing_type)) {
      return true;
    }
    return false;
  }

  const getDeliveries = () => {
    if (!invoiceDetails.customerId) {
      setAssets([]);
      setSelectedAssets([]);
      return;
    }
    if (
      !isDateValid(invoiceDetails.billingDate) ||
      !isDateValid(invoiceDetails.invoiceDate)
    ) {
      toast.error("Invoice or billing date cannot be in the future.");
      return;
    }
    setLoading(true);
    fetchJson(
      `${API_BASE_URL}/rentalgetAllLines/${invoiceDetails.customerId || 0}`,
      {
        method: "POST",
        body: JSON.stringify({ billingDate: invoiceDetails.billingDate }),
      }
    )
      .then((res) => {
        setAssets(res.data || []);
        setSelectedAssets([]);
        setSummary((s) => ({
          ...s,
          activeAssets:
            res.data?.filter((a) => a.row_close !== "y").length || 0,
          totalAssets: res.data?.length || 0,
          selectedItems: 0,
        }));
      })
      .catch(() => setAssets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    handleInputChange("customGst", 0);
    getDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceDetails.customerId, invoiceDetails.billingDate, invoiceDetails.invoiceDate]);

  useEffect(() => {
    setSummary((s) => ({
      ...s,
      selectedItems: selectedAssets.length,
    }));
  }, [selectedAssets]);

  useEffect(() => {
    setLoading(true);
    const company_id = Cookies.get("company_id");
    fetchJson(
      `${API_BASE_URL}/companyMaster/${company_id || 1}`,
      {
        method: "GET",
        body: JSON.stringify(),
      }
    ).then((res) => {
      const data = res.data[0] ?? {};
      setInvoiceDetails((prev) => ({
        ...prev,
        "company_state_id": data.state ?? '0'
      }));
    }).finally(() => setLoading(false));
  }, [customer]);

  const isSelected = (itemID) =>
    selectedAssets.some((item) => item.itemID === itemID);

  const toggleSelect = (itemID) => {
    const item = assets.find((a) => a.itemID === itemID);
    if (!item) return;
    setSelectedAssets((prev) => {
      const alreadySelected = prev.some((i) => i.itemID === itemID);
      return alreadySelected
        ? prev.filter((i) => i.itemID !== itemID)
        : [...prev, item];
    });
  };

  const selectAll = () => {
    setSelectedAssets(assets.filter((a) => !isDisabled(a)));
  };

  const clearSelection = () => setSelectedAssets([]);

  const subtotal = selectedAssets.reduce(
    (sum, a) =>
      compareDate(invoiceDetails.billingDate, a.last_bill_date, a.billing_type)
        ? sum + Number(a.revenue || 0)
        : sum,
    0
  );

  // GST Calculation based on company state and customer state
  let cgst = 0, sgst = 0, igst = 0;
  console.log('invoiceDetails.company_state_id :',invoiceDetails.company_state_id);
  console.log('customer.gst_state :',customer.gst_state);
  

  if (invoiceDetails.is_gst_billing === "yes") {
    if (customer?.gst_state && invoiceDetails.company_state_id && customer.gst_state.toString() !== invoiceDetails.company_state_id.toString()){
      invoiceDetails.stateGst = 0; 
      invoiceDetails.centralGst = 0; 
      invoiceDetails.interGst = invoiceDetails.customGst; 
    }else{
      invoiceDetails.interGst = 0; 
      invoiceDetails.stateGst = (invoiceDetails.customGst) ? (invoiceDetails.customGst / 2) : 0; 
      invoiceDetails.centralGst = (invoiceDetails.customGst) ? (invoiceDetails.customGst / 2) : 0; 
    } 
    if (customer?.gst_state && invoiceDetails.company_state_id && customer.gst_state.toString() !== invoiceDetails.company_state_id.toString()) {
      // Interstate → IGST
      igst = Math.round(
        subtotal * (Number(invoiceDetails.interGst || 0) / 100)
      );
    } else {
      // Intrastate → CGST + SGST
      cgst = Math.round(
        subtotal * (Number(invoiceDetails.centralGst || 0) / 100)
      );
      sgst = Math.round(
        subtotal * (Number(invoiceDetails.stateGst || 0) / 100)
      );
    }
  }
  // if (invoiceDetails.is_gst_billing === "yes") {
  //   // Interstate → IGST
  //   interGstAmount = Math.round(
  //     subtotal * (Number(invoiceDetails.interGstPercent || 0) / 100)
  //   );
  // }
  const gst = cgst + sgst + igst ;
  const totalAmount = formatAmount(subtotal + gst);
  const handleGenerateInvoice = async () => {
    swalObj
      .fire({
        title: "Confirm To Generate Invoice ?",
        text: "Once generated, the invoice cannot be edited.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, generate it!",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          if (selectedAssets.length === 0) return;

          const payload = {
            ...invoiceDetails,
            selectedAssets,
            summary,
          };

          setLoading(true);
          const res = await fetchJson(`${API_BASE_URL}/rental/createInvoice`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          setLoading(false);

          if (res?.flag === "S") {
            swalObj.fire(
              "Generated!",
              "Your invoice has been generated.",
              "success"
            );
            getDeliveries();
          } else {
            swalObj.fire(
              "Failed!",
              `Error while creating invoice ! ${res.status}`,
              "error"
            );
          }
        }
      });
  };
  const validateNumber = (value) => {
    let sanitizedValue = value.replace(/^0+/, '') || '0';

    if (!/^\d+$/.test(sanitizedValue)) {
      toast.error("GST must be an integer between 0 and 100.");
      sanitizedValue = 0;
    }

    if (sanitizedValue < 0 || sanitizedValue > 100) {
      toast.error("GST must be between 0 and 100.");
      sanitizedValue = 0;
    }

    // Remove leading zeros by converting it to a number and then back to string
    handleInputChange("customGst", sanitizedValue);
  };
  const capitalizeFirst = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  return (
    <div className="bg-gray-50 min-h-screen py-4 px-2 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Customer Invoice</h1>
          <div className="text-gray-500 text-sm">
            Generate monthly billing for rental equipment
          </div>
        </div>
      </div>

      {/* Invoice Setup */}
      <div className="bg-white shadow rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
          <SmartSelectInput
            id="customer"
            label=""
            value={invoiceDetails.customerId}
            onSelect={(data) => handleInputChange("customerId", data)}
            onObjectSelect={(data) => { setCustomer(data.original); console.log(data) }}
            config={{
              type: "customer",
              valueKey: "customer_id",
              source: "customer",
              getLabel: (item) => `${item.name}`,
              getValue: (item) => item.customer_id,
              placeholder: "Select Customer",
              list: "name,customer_id,gst_state",
              allowAddNew: true,
              preload: true,
              cache: true,
              statusCheck: true,
              showRecent: true,
            }}
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Date
          </label>
          <DatePicker
            selected={invoiceDetails.invoiceDate}
            minDate={new Date()}   // prevent past dates
            maxDate={new Date()}   // prevent future dates
            onChange={(date) => handleInputChange('invoice_date', date?.toISOString())}
            className="ws-date form-input w-full text-gray-600 bg-gray-100 rounded focus:outline-none px-3 py-2 pr-10 px-2 py-1 text-sm"
            placeholderText="Select a date"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Billing Date
          </label>
          <DatePicker
            minDate={new Date()}   // prevent past dates
            maxDate={new Date()}   // prevent future dates
            selected={invoiceDetails.billingDate}
            onChange={(date) => handleInputChange('billingDate', date?.toISOString())}
            className="ws-date form-input w-full text-gray-600 bg-gray-100 rounded focus:outline-none px-3 py-2 pr-10 px-2 py-1 text-sm"
            placeholderText="Select a date"
            dateFormat="yyyy-MM-dd"
          />
        </div>
      </div>

      {/* Assets */}
      <div className="bg-white shadow rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold text-gray-800">
            Select Assets to Invoice
            <span className="font-semibold text-sm ml-1.5 text-blue-500">
              ( Total Assets {summary.totalAssets} )
            </span>

          </div>
          <div className="text-xs">
            <button
              onClick={selectAll}
              className={` mr-4 hover:underline ${assets.length == 0 ? 'text-gray-500' : 'text-blue-500'}`}
              disabled={assets.length == 0}
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="text-gray-400 hover:text-red-500 hover:underline"
            >
              Clear Selection
            </button>
          </div>
        </div>

        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : assets.length === 0 ? (
          <div className="text-gray-400 text-sm py-8 text-center">
            No assets available. Select a customer to load assets.
          </div>
        ) : (
          assets.map((a) => {
            const disabled = (a.revenue == 0) || isDisabled(a);
            console.log('disabled : ', disabled);
            return (
              <div
                key={a.itemID}
                className={clsx(
                  "border p-3 rounded-lg mb-2 hover:bg-gray-50 transition cursor-pointer",
                  disabled && "opacity-50 pointer-events-none"
                )}
                onClick={() => !disabled && toggleSelect(a.itemID)}
              >
                <div className="flex items-center">
                  <div className="mr-3">
                    {isSelected(a.itemID) ? (
                      <CheckSquare className="text-blue-500" size={22} />
                    ) : (
                      <Square className="text-gray-400" size={22} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-600">

                      <span>
                        {a.invoiceLineNarr || "Product"}
                      </span>
                      <span>
                        {a.billing_type && (
                          <span className="font-normal text-sm ml-1.5">
                            ({capitalizeFirst(a.billing_type) || ""})
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="mr-1">
                        {a.product_serial_no || "-"} |
                      </span>
                      {a.challan_number && <> Challan: {a.challan_number}</>} |
                      Delivered:{" "}
                      {a.deliveryDate
                        ? new Date(a.deliveryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
                        : "-"}
                      {a.last_bill_date && (
                        <><span>|</span><span className="text-red-400"> Last Invoice Date: {new Date(a.last_bill_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span></>
                      )}
                      {a.returnDate && (
                        <span className="text-red-400 ml-2">(Returned)</span>
                      )}
                      {a.billing_type === "contract" && (
                        <span className="text-red-400 ml-2">| Contract Start : {new Date(a.contract_start).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} Contract End : {new Date(a.contract_end).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">
                      {a.is_replacement == 'y' && (<><span className="mx-1 text-green-900">REPL</span><span>| </span></>)}
                      {a.upgraded_bill == 'Y' && a.upgraded_rate && (
                        <>
                          <span className="text-red-400">
                            Upgraded Rate ₹{a.upgraded_rate}
                          </span>
                          <span className="mx-1"> |</span>
                        </>
                      )}
                      <span className="">
                        Rate: ₹{a.invoiceLineRate}/month
                      </span>
                    </div>
                    <div className="text-green-600 font-bold">

                      <span>
                        ₹{a.revenue}
                      </span>
                      <span className="ml-1 text-xs text-gray-500">
                        {a.total_rent_days || 0}{" "}
                        {a.billing_type === "monthly" ||
                          a.billing_type === "contract"
                          ? "Months"
                          : "Days"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-1 text-sm text-gray-500 flex items-center">
                  {a.replaced_revenue && Object.entries(a.replaced_revenue).length != 0 && (
                    <>
                      <span>Replace Items Note: {!a.replaced_revenue && (<span>N/A</span>)} </span>
                      {a.replaced_revenue && (
                        <>
                          <span className="mx-1 text-green-500">
                            Replaced item bill is added in this item bill.
                          </span>
                          <span className="mx-1">
                            | Replaced item revenue : {a.replaced_revenue?.revenue} |
                          </span>
                          {a.replaced_revenue?.billing_type && (
                            <span className="mx-1">
                              Billing Type : {a.replaced_revenue?.billing_type == "contract" ? 'Monthly' : a.replaced_revenue?.billing_type}
                            </span>
                          )}
                          {a.replaced_revenue?.start && a.replaced_revenue?.end && (
                            <span className="mx-1">
                              Billing Period : {a.replaced_revenue?.start} to {a.replaced_revenue?.end}
                            </span>
                          )}
                        </>
                      )
                      }
                      <span className="text-xs text-gray-400">
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invoice Summary */}
      <div className="bg-white shadow rounded-xl p-4 mb-10">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="font-semibold mb-2 text-gray-800">
              Amount Calculation
            </div>
            <div className="text-xs mb-1 flex justify-between">
              Subtotal: <span className="text-gray-700">₹{subtotal}</span>
            </div>
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="is_gst_billing"
                checked={invoiceDetails.is_gst_billing === "yes" ? true : false}
                onChange={(e) => {
                  handleInputChange("customGst", 0);
                  handleInputChange("is_gst_billing", e.target.checked ? 'yes' : 'no');
                }}
                className="mr-2"
              />
              <label htmlFor="is_gst_billing" className="text-sm text-gray-700">
                Include GST
              </label>
              {invoiceDetails.is_gst_billing == 'yes' && (
                <div className="flex-1 min-w-[50px] max-w-[50px] mb-1 ml-3">
                  {/* <label className="text-sm block text-gray-700">Enter GST</label> */}
                  <input
                    id="customGst"
                    type="number"
                    value={invoiceDetails.customGst}
                    placeholder="GST"
                    onChange={(e) => validateNumber(e.target.value) }
                    className="w-20 border border-gray-300 rounded px-2 py-1 pr-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
            {invoiceDetails.is_gst_billing === "yes" ? (
              <>
              {cgst > 0 && (
                <div className="text-xs mb-1 flex justify-between">
                  CGST ({invoiceDetails.centralGst}%):
                  <span className="text-gray-700">₹{cgst}</span>
                </div>
              )}
              {sgst > 0 && (
                <div className="text-xs mb-1 flex justify-between">
                  SGST ({invoiceDetails.stateGst}%):
                  <span className="text-gray-700">₹{sgst}</span>
                </div>
              )}
              {igst > 0 && (
                <div className="text-xs mb-1 flex justify-between">
                  IGST ({invoiceDetails.interGst}%):
                  <span className="text-gray-700">₹{igst}</span>
                </div>
              )}
            </>
            ) : ''}
            {/* <div className="text-xs mb-1 flex justify-between">
              GST ({invoiceDetails.interGstPercent}%):
              <span className="text-gray-700">₹{interGstAmount}</span>
            </div> */}
            <div className="text-lg font-bold mt-2 flex justify-between">
              Total Amount:{" "}
              <span className="text-green-600">₹{totalAmount}</span>
            </div>
          </div>
        </div>
        <div className="flex bg-white flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-gray-400 flex-1">
            <span>All billing calculations are based on actual usage days</span>
          </div>
          <div className="flex gap-2">
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
    </div>
  );
}
