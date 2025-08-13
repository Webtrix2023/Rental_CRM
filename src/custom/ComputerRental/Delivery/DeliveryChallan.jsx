import React, { useState,useMemo, useEffect } from "react";
import DeliveryChallanItems from "./DeliveryChallanItems";
import { SmartSelect, SmartSelectInput } from "@components/index";
import { defaultFormTemplate } from "./API/DeliverySchema";
import DatePicker from "react-datepicker";
import { API_BASE_URL } from "@config";
import { fetchJson } from "@utils/fetchJson";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
export default function DeliveryChallanForm() {
  const { record_id } = useParams();
  const [defaultFormData, setDefaultFormData] = useState(defaultFormTemplate);
  const memoFormData = useMemo(() => defaultFormData, [defaultFormData]);
  function parseDate(dateStr) {
  // Supports "YYYY-MM-DD" or "DD-MM-YYYY"
  if (!dateStr || dateStr === "0000-00-00") return null;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    // Check if first part is year or day
    if (parts[0].length === 4) {
      // "YYYY-MM-DD"
      return new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      // "DD-MM-YYYY"
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }
  return null;
}


  useEffect(()=>{
    const userData = JSON.parse(localStorage.getItem('user'));
    setDefaultFormData(prev => ({ ...prev, 'company_id': userData?.default_company,invoiceDate:new Date()}));
  },[])
  
  useEffect(() => {
  if (!record_id) return;
  // Fetch existing delivery challan data
  const fetchData = async () => {
    try {
      const res = await fetchJson(`${API_BASE_URL}/rentaldeliveryChallan/${record_id}`);
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        const record = res.data[0];
        console.log(record);
        // Set form data
        setDefaultFormData((prev) => ({
          ...prev,
          ...record,
          // Convert string date to Date object for DatePicker
          invoiceDate: record.invoiceDate ? parseDate(record.invoicseDate) : null,
          dispatch_date: record.dispatch_date ? parseDate(record.dispatch_date) : (record.dispatch_date === undefined && record.dispatchDate ? parseDate(record.dispatchDate) : null),
        }));
        // Set items list
        if (Array.isArray(record.invoiceLine) && record.invoiceLine.length > 0) {
          setItems(
            record.invoiceLine.map((item, idx) => ({
              ...item,
              srNo: idx + 1,
            }))
          );
        }
      }
    } catch (err) {
      toast.error("Failed to load Delivery Challan data");
    }
  };

  fetchData();
}, [record_id]);

  const handleInputChange = (field, value) => {
      setDefaultFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const [items, setItems] = useState([
    {
      srNo:1,
      invoiceLineChrgID:null,
      productObject:null,
      itemID: null,
      accessories:null,
      invoiceLineQty: 1,
      invoiceLineAmount: "0.00",
      invoiceLineUnit: "Pcs",
      invoiceLineNarr: "",
      extras: {},
      is_gst:"n",
      contract_start:null,
      contract_end:null,
      billing_type:"monthly",
      charger: "no",
      charger_number:"",
      serial_no: "",
      invoiceID:null,
    },
  ]);
  useEffect(()=>{
    console.log(items);
  },[items])
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  // GST/total logic
  const subtotal = items.reduce(
    (acc, i) => acc + parseFloat(i.invoiceLineAmount || 0),
    0
  );
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const total = subtotal + cgst + sgst;

  const handleSave = async (type) => {
    const statusValue = type === 'draft' ? 'draft' : 'approved'; // set logic as needed
    const formToSend = { ...defaultFormData, status: statusValue };

   const errorMessages = [];
    items.forEach((item, idx) => {
    if (item.invoiceLineChrgID != null && item.invoiceLineChrgID !== "") {
    const invalidFields = [];
    if (Number(item.invoiceLineQty) <= 0) invalidFields.push('Quantity');
    if (Number(item.invoiceLineAmount) <= 0) invalidFields.push('Amount');
    if (invalidFields.length) {
      errorMessages.push(
        `Row ${idx + 1}${item.product_name ? ` (${item.product_name})` : ''}: ${invalidFields.join(' and ')} must be greater than 0.`
      );
    }
  } else {
    errorMessages.push(`Row ${idx + 1}: Product not selected.`);
  }
});
  if(defaultFormData.customer_id === "" || defaultFormData.customer_id === null){
    errorMessages.push(`Customer Not Selected`);
  }
  if(defaultFormData.invoiceDate === "" || defaultFormData.invoiceDate === null){
    errorMessages.push(`Delivery Date Not Selected`);
  }
  if (errorMessages.length) {
  toast.error(
    <div>
      <b>Error while creating invoice:</b>
      <ul style={{ marginLeft: 12 }}>
        {errorMessages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>,
    { autoClose: 7000 }
  );
  return;
}

   const updatedInvoiceData = [formToSend, ...items];
      const res = await fetchJson(`${API_BASE_URL}/rentaldeliveryItemList`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedInvoiceData),
      });
      if(res?.flag === "S"){
            toast.success(`Delviery Challan Created`);
      }else{
          toast.error(`Error while creating invoice. (${res.msg})`);
      }
  
    };
  return (
    <div className="bg-[#f6f8fc] min-h-screen">
      {/* HEADER HERO */}
      <section className="max-w-5xl mx-auto pt-10 pb-3 flex bg-blue-50 items-start gap-8">
        <div className="flex-1 pl-3">
          <h1 className="text-[2rem] pt-2 font-bold leading-tight">
            Create Delivery Challan
          </h1>
        </div>
        <div>
          <div className="w-44 h-44 rounded-2xl bg-white shadow-md flex items-center justify-center">
            <img
              src="/Rental/delivery-truck.png"
              alt="Delivery Truck"
            />
          </div>
        </div>
      </section>

      {/* FORM */}
      <form
        className="max-w-5xl mx-auto bg-white shadow rounded-2xl px-8 pt-7 pb-10 mb-10"
        style={{ marginTop: "-48px" }}
      >
        {/* CUSTOMER & ORDER INFO */}
        <section className="mb-7">
          <h2 className="font-semibold text-lg mb-3">Customer & Order Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-gray-500 text-sm mb-1">Delivery Number</label>
              <input
                type="text"
                className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10 rounded"
                placeholder="Auto Generated"
                value={defaultFormData?.invoiceNumber == null ? "Auto Generated": defaultFormData?.invoiceNumber}
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Customer</label>
              <SmartSelectInput
                id="customer" label="" value={defaultFormData?.customer_id}
                onSelect={(data) => {
                handleInputChange("customer_id",data)}}
                onObjectSelect={()=>{}}
                config={{type: 'customer',valueKey:'customer_id',source: 'customer',
                getLabel: (item) => `${item.name}`,
                getValue: (item) => item.customer_id,
                placeholder: 'Select Customer',
                list:"name,customer_id",
                allowAddNew: true,preload: true,cache: true,showRecent: true}}
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Delivery Date</label>
              <DatePicker
                style={{ width: "100%" }}
                selected={defaultFormData?.invoiceDate}
                onChange={(date) => handleInputChange('invoiceDate', date?.toISOString())}
                className="ws-date form-input w-full text-gray-600 bg-gray-100 rounded focus:outline-none px-3 py-2 pr-10 px-2 py-1 text-sm"
                placeholderText="Select a date"
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                
                calendarClassName="custom-datepicker-calendar"
              />

              {/* <input
                type="date"
                className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10 rounded"
                name="deliveryDate"
                value={form.deliveryDate}
                onChange={e =>
                  setForm(f => ({ ...f, deliveryDate: e.target.value }))
                }
                required
              /> */}
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Status</label>
              <select
                className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10 rounded"
                name="is_replacement"
                value={defaultFormData.is_replacement}
                onChange={(e) =>{
                  handleInputChange("is_replacement",e.target.value);
                }}
              >
                <option value="n">New</option>
                <option value="y">Replacement</option>
              </select>
            </div>
            
          </div>
          <button
            type="button"
            className="mt-4 text-[#2563eb] hover:underline text-sm"
            onClick={() => setShowOrderDetails(v => !v)}
          >
            Additional Order Details <span className="ml-1">{showOrderDetails ? "▲" : "▼"}</span>
          </button>
          {showOrderDetails && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
              {/* Add the rest of the order details fields here as needed */}
              <div>
              <label className="block text-gray-500 text-sm mb-1">Dispatch Date</label>
              <DatePicker
                selected={defaultFormData?.dispatch_date}
                onChange={(date) => handleInputChange('dispatch_date', date?.toISOString())}
                className="ws-date form-input w-full text-gray-600 bg-gray-100 rounded focus:outline-none px-3 py-2 pr-10 px-2 py-1 text-sm"
                placeholderText="Select a date"
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                calendarClassName="custom-datepicker-calendar"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Dispatch Doc No.</label>
              <input
                className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10 rounded"
                placeholder="Enter document number"
                name="dispatchDocNo"
                value={defaultFormData?.dispatch_doc_no}
                onChange={(e) =>{
                  handleInputChange("dispatch_doc_no",e.target.value)}}
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">Dispatch Through</label>
              <input
                className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10 rounded"
                placeholder=""
                name="dispatch_through"
                value={defaultFormData?.dispatch_through}
                onChange={(e) =>{
                  handleInputChange("dispatch_through",e.target.value)}}
              />
            </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Buyers Order No./ PO No.</label>
                <input className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10 rounded"
                value={defaultFormData?.buyers_order_no}
                onChange={(e) =>{
                  handleInputChange("buyers_order_no",e.target.value)}} />
              </div>
              <div className="w-full">
              <label className="block text-gray-500 text-sm mb-1">Order Date / PO Date</label>
              <DatePicker
                selected={defaultFormData?.order_date}
                onChange={(date) => handleInputChange('order_date', date?.toISOString())}
                className="ws-date w-full form-input w-full text-gray-600 bg-gray-100 rounded focus:outline-none px-3 py-2 pr-10 px-2 py-1 text-sm"
                placeholderText="Select a date"
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                calendarClassName="custom-datepicker-calendar"
              />
            </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Destination</label>
                <input className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10 rounded" 
                value={defaultFormData?.destination}
                onChange={(e) =>{
                  handleInputChange("destination",e.target.value)}}
                  />
              </div>
              {/* <div>
                <label className="block text-gray-500 text-sm mb-1">Mode/Terms of Payment</label>
                <input className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10 rounded"
                 value={defaultFormData?.mode_or_terms_of_payment}
                onChange={(e) =>{
                  handleInputChange("mode_or_terms_of_payment",e.target.value)}}
                   />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Terms of Delivery</label>
                <input className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10 rounded"
                 value={defaultFormData?.mode_or_terms_of_payment}
                onChange={(e) =>{
                  handleInputChange("mode_or_terms_of_payment",e.target.value)}}
                   />
              </div> */}
              {/* <div>
                <label className="block text-gray-500 text-sm mb-1">Other Reference</label>
                <input className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10 rounded"
                 value={defaultFormData?.mode_or_terms_of_payment}
                onChange={(e) =>{
                  handleInputChange("mode_or_terms_of_payment",e.target.value)}}
                   />
              </div> */}
              <div>
                <label className="block text-gray-500 text-sm mb-1">Refrence Note</label>
                <input className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10 rounded"
                 value={defaultFormData?.ref_note}
                onChange={(e) =>{
                  handleInputChange("ref_note",e.target.value)}}
                   />
              </div>
              <div>
                <label className="block text-gray-500 text-sm mb-1">Supplier Refrence</label>
                <input className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10 rounded"
                 value={defaultFormData?.supplier_ref}
                onChange={(e) =>{
                  handleInputChange("supplier_ref",e.target.value)}}
                   />
              </div>
            </div>
          )}
        </section>

        {/* PRODUCT DETAILS */}
        <section className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-lg flex items-center gap-2">
              <span className="text-[#2563eb]">🗂️</span> Product Details
            </span>
          </div>
          <DeliveryChallanItems items={items} setItems={setItems} />
          <div className="flex items-center justify-end mt-3 mb-3">
          <button
              type="button"
              className="bg-[#2563eb] hover:bg-[#1741a3] text-white rounded-lg px-5 py-2 font-medium transition"
              onClick={() =>
                setItems(prevItems => {
                const newItems = [
                  ...prevItems,
                  {
                    productObject:null,
                    invoiceLineChrgID: "",
                    invoiceLineQty: 1,
                    invoiceLineRate: "0.00",
                    invoiceLineUnit: "Pcs",
                    invoiceLineNarr: "",
                    invoiceLineAmount: "0.00",
                    contract_start:null,
                    contract_end:null,
                    extras: {},
                    itemID:null,
                    accessories:null,
                    is_gst:"n",
                    billing_type:"monthly",
                    charger: "no",
                    charger_number:"",
                    serial_no: "",
                    invoiceID:defaultFormData?.invoiceID,
                  },
                ].map((item, idx) => ({
                  ...item,
                  srNo: idx + 1, // Set srno from 1
                }));

                return newItems;
              })
              }
            >+ Add More Product</button>
            </div>
        </section>

        {/* TOTALS & GST */}
        <section className="bg-[#f6f8fc] rounded-xl p-6 flex flex-col md:flex-row md:items-start gap-10 mb-7">
            <div className="w-full md:w-1/2 flex flex-col gap-3">
            <div>
              &nbsp;
            </div>
            <div>
              &nbsp;
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span>Subtotal:</span>
                <span className="font-medium text-black">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>CGST (9%):</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>SGST (9%):</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-[#2563eb]">₹{total.toFixed(2)}</span>
            </div>
          </div>
          
        </section>

        {/* CTA */}
        <div className="flex flex-row items-end justify-end gap-2">
          {record_id !=="" && defaultFormData.status !== "approved" ?( <button
            type="button" onClick={()=>{handleSave('draft')}}
            className="hover:bg-[#2563eb] hover:text-white max-w-xs text-[#1741a3] rounded-xl border px-3 py-2 text-md transition"
          >Save Draft
          </button>
          ):("")}
          {record_id !==""  && defaultFormData.status !== "approved" ? (
          <button
            type="button" onClick={()=>{handleSave('approved')}}
            className="bg-[#2563eb] hover:bg-[#1741a3] max-w-xs text-white rounded-xl px-3 py-2 text-md transition"
          >Create Delivery Challan
          </button>
          ):("")}
          {/* <div className="text-gray-400 text-sm mt-2 flex items-center gap-2">
            <span>🛈 Need help?</span>
            <a href="mailto:support@webtrixsolutions.in" className="text-[#2563eb] underline">
              Contact support
            </a>
          </div> */}
        </div>
      </form>
    </div>
  );
}
