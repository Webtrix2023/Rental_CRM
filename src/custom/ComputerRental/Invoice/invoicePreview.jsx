import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { ReportExport } from "./ReportExport";
import withReactContent from "sweetalert2-react-content";
import { Calendar, CheckSquare, Square, Plus } from "lucide-react";
import clsx from "clsx";
import { SmartSelectInput } from "@components/index";
import { API_BASE_URL } from "@config";
import { fetchJson } from "@utils/fetchJson";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

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

export default function invoicePreview() {
  const { record_id } = useParams();
  const invoiceID = record_id;

  // UI state
  const [invoiceDetails, setInvoiceDetails] = useState({});
  const [assets, setAssets] = useState([]);
  // const [selectedAssets, setSelectedAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setInvoiceDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    setLoading(true);
    const company_id = 1;
    fetchJson(
      `${API_BASE_URL}/companyMaster/${company_id || 0}`,
      {
        method: "GET",
        body: JSON.stringify(),
      }
    ).then((res) => {
      const data = res.data[0] ?? {};
      setInvoiceDetails((prev) => ({
        ...prev,
        "centralGst": data.centralGst ?? '9',
        "stateGst": data.centralGst ?? '9',
        "interGst": data.interGst ?? '18',
        "company_state_id": data.state ?? '0'
      }));
    }).finally(() => setLoading(false));
  }, []);
  const isDateValid = (date) => {
    if (!date) return false;
    const d = new Date(date);
    const today = new Date();
    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return d <= today;
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
  const capitalizeFirst = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  const isDisabled = (a) =>
    a.row_close === "y" ||
    !compareDate(invoiceDetails.billingDate, a.last_bill_date, a.billing_type);

  const getDeliveries = () => {
    if (!invoiceID) {
      return;
    }
    setLoading(true);
    fetchJson(
      `${API_BASE_URL}/rentaltaxInvoice/${invoiceID || 0}`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    )
      .then((res) => {
        const data = res.data ?? null;
        if (data) {
          setInvoiceDetails(data.invoiceData || {});
          setAssets(data.invoiceline || []);
          console.log(data);
        }
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getDeliveries();
  }, []);

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
        {/* <ReportExport invoiceID={invoiceID}/> */}
      </div>

      {/* Invoice Setup */}
      <div className="bg-white shadow rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold mb-1">Customer</label>
          <SmartSelectInput
            id="customer"
            label=""
            value={invoiceDetails.customer_id}
            onSelect={(data) => handleInputChange("customerId", data)}
            onObjectSelect={() => { }}
            config={{
              type: "customer",
              valueKey: "customer_id",
              source: "customer",
              getLabel: (item) => `${item.name}`,
              getValue: (item) => item.customer_id,
              placeholder: "Select Customer",
              list: "name,customer_id",
              allowAddNew: true,
              preload: true,
              cache: true,
              showRecent: true,
            }}
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold mb-1">
            Invoice Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={invoiceDetails.invoiceDate}
              onChange={(e) =>
                handleInputChange("invoiceDate", e.target.value)
              }
              className="w-full border rounded px-3 py-2 text-gray-700  focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[140px]"></div>
      </div>

      {/* Assets */}
      <div className="bg-white shadow rounded-xl p-4 mb-6">
        {console.log(assets)}
        {loading ? (
          <>
            <SkeletonRow />
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
            return (
              <div
                key={a.itemID}
                className={clsx(
                  "flex items-center border p-3 rounded-lg mb-2 hover:bg-gray-50 transition cursor-pointer"
                )}
              >
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
                      {a.product_serial_no || "-"}
                    </span>
                    <span>
                      | {new Date(a.last_bill_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} - {new Date(invoiceDetails.invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">
                    Rate: ₹{a.invoiceLineRate}/month
                  </div>
                  <div className="text-green-600 font-bold">
                    ₹{a.invoiceLineAmount}
                    <span className="ml-1 text-xs text-gray-500">
                      {a.invoiceLineQty || 0}{" "}
                      {a.billing_type === "monthly" ||
                        a.billing_type === "contract"
                        ? "Months"
                        : "Days"}
                    </span>
                  </div>
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
              Subtotal: <span className="text-gray-700">₹{invoiceDetails.invoiceTotal}</span>
            </div>
            {invoiceDetails.is_gst_billing === "yes" ? (
              <>
                {invoiceDetails.centralGstAmount > 0 && (
                  <div className="text-xs mb-1 flex justify-between">
                    CGST ({invoiceDetails.centralGstPercent}%):
                    <span className="text-gray-700">₹{invoiceDetails.centralGstAmount}</span>
                  </div>
                )}
                {invoiceDetails.stateGstAmount > 0 && (
                  <div className="text-xs mb-1 flex justify-between">
                    SGST ({invoiceDetails.stateGstPercent}%):
                    <span className="text-gray-700">₹{invoiceDetails.stateGstAmount}</span>
                  </div>
                )}
                {invoiceDetails.interGstAmount > 0 && (
                  <div className="text-xs mb-1 flex justify-between">
                    IGST ({invoiceDetails.interGstPercent}%):
                    <span className="text-gray-700">₹{invoiceDetails.interGstAmount}</span>
                  </div>
                )}
              </>
            ) : ''}
            <hr className="text-gray-400 my-4"></hr>
            <div className="text-lg font-bold mt-2 flex justify-between">
              Total Amount:{" "}
              <span className="text-green-600">₹{invoiceDetails.grossAmount}</span>
            </div>
          </div>
        </div>
        <div className="flex bg-white flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-gray-400 flex-1">
            <span>All billing calculations are based on actual usage days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
