import React from "react";
import { SmartSelect, SmartSelectInput } from "@components/index";
import ProductSearchInput from "../Delivery/ProductSearchInput";
import DatePicker from "react-datepicker";
export default function QuotationItemRow({
  index,
  data,
  updateRow,
  removeRow,
  disabledProductIds
}) {
  // Basic field handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateRow(index, { [name]: value });
    if (name === "invoiceLineRate" || name === "invoiceLineQty") {
      const qty = name === "invoiceLineQty" ? value : data.invoiceLineQty;
      const rate = name === "invoiceLineRate" ? value : data.invoiceLineRate;
      const amt = (parseFloat(qty || 0) * parseFloat(rate || 0)).toFixed(2);
      updateRow(index, { invoiceLineAmount: amt });
    }
  };

  //  const handleInputChange = (field, value) => {

  //     if(field ==="contract_end" && field ==="contract_start"){
  //       if(data.contract_end < data.contract_start){
  //         updateRow(index, {'contract_start':data.contract_end});
  //       }else{
  //         updateRow(index, { [field]: value });
  //       }
  //     }else{
  //       updateRow(index, { [field]: value });
  //     }

  //   };
  const toTs = (v) => {
    if (!v) return null;
    if (v instanceof Date) return new Date(v.getFullYear(), v.getMonth(), v.getDate()).getTime();
    if (typeof v === 'number') return v;

    if (typeof v === 'string') {
      let m;
      if ((m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/))) {
        return new Date(+m[1], +m[2] - 1, +m[3]).getTime();
      }
      if ((m = v.match(/^(\d{2})-(\d{2})-(\d{4})$/))) {
        return new Date(+m[3], +m[2] - 1, +m[1]).getTime();
      }
      if ((m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/))) {
        return new Date(+m[3], +m[2] - 1, +m[1]).getTime();
      }
      const d = new Date(v);
      return isNaN(d) ? null : d.getTime();
    }
    return null;
  };

  const handleInputChange = (field, value) => {
    // next row snapshot
    const next = { ...data, [field]: value };

    const tStart = toTs(next.contract_start);
    const tEnd = toTs(next.contract_end);

    if (tStart != null && tEnd != null && tEnd < tStart) {
      if (field === 'contract_end') {
        // end moved before start → pull start back to end
        updateRow(index, { contract_end: value, contract_start: value });
        return;
      }
      if (field === 'contract_start') {
        // start moved after end → push end forward to start
        updateRow(index, { contract_start: value, contract_end: value });
        return;
      }
    }

    // normal update
    updateRow(index, { [field]: value });
  };
  function safeParse(obj) {
    if (!obj || obj === 'null' || obj === '') return null;
    if (typeof obj === 'object') return obj;
    try {
      console.log("jdata");
      console.log(JSON.parse(obj));
      return JSON.parse(obj);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  return (
    <div className="w-full border-b last:border-b-0 bg-white hover:bg-gray-50 transition px-4 py-3">
      {/* Row 1: Main Fields */}
      <div className="grid grid-cols-7 gap-3">
        <div className="col-span-3">
          <ProductSearchInput
            value={safeParse(data.productObject)}
            disabledProductIds={disabledProductIds}
            //stockDisable={false}
            stockCheckDisable={false}
            onChange={prod => {
              if (prod) {
                console.log(prod);
                updateRow(index, {
                  qtyDisable: prod ? prod.qtyBalance === "1" ? true : false : false,
                  invoiceLineChrgID: prod ? prod.product_id : "",
                  productObject: prod || null,
                  invoiceLineRate: prod ? prod.price : 0,
                  is_gst: prod ? prod.with_tax : 'no',
                  igst: prod ? prod.tax : 0,
                  discount: prod ? prod.discount : 0,
                  discount_type: prod ? prod.discount_type : 'per',
                  invoiceLineAmount: prod ? `${prod.price ? (prod.price * prod.qtyBalance) : 0}` : 0,
                  invoiceLineNarr: [
                    prod.productName,
                    prod.modelName,
                    prod.memory,
                    prod.HDDCapacity,
                  ].filter(Boolean).join(" · ")
                });
              } else {
                updateRow(index, {
                  qtyDisable: false,
                  invoiceLineChrgID: "",
                  productObject: null,
                  invoiceLineNarr: "",
                  invoiceLineRate: 0,
                  is_gst: 'no',
                  igst: 0,
                  discount: 0,
                  discount_type: 'per',
                  invoiceLineAmount: 0,
                });
              }
            }} />
        </div>
        <div className="col-span-1">
          <input disabled={data.qtyDisable} className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-1"
            name="invoiceLineQty" type="number" min={1} value={data.invoiceLineQty} onChange={handleChange} />
        </div>
        <div className="col-span-1">
          <input
            className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10"
            name="invoiceLineRate"
            value={data.invoiceLineRate}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>
        <div className="col-span-1">
          <input
            className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10"
            name="invoiceLineAmount"
            value={data.invoiceLineAmount}
            disabled
          />
        </div>
        <div className="col-span-1 text-right">
          <button
            type="button"
            className="px-2 py-1 text-red-600 hover:text-red-800 text-xl"
            onClick={() => removeRow(index)}
            title="Remove Row"
          >
            🗑️
          </button>
        </div>
      </div>
      {/* Row 2: Description + Additional Items */}
      <div className="grid grid-cols-7 gap-6 mt-3">
        {/* Description */}
        <div class="col-span-3 grid grid-cols-4 gap-6">
          <div class="col-span-2">
            <label className="block text-gray-600 mb-1 text-sm">Description</label>
            <textarea
              className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10"
              name="invoiceLineNarr"
              value={data.invoiceLineNarr}
              onChange={handleChange}
              rows={2}
              placeholder="Product description"
            />
          </div>
          <div class="col-span-2">
            <label className="block text-gray-600 mb-1 text-sm">Charger Serial No.</label>
            <SmartSelectInput
              id="charger_number" label="" value={data?.charger_number}
              onSelect={(data) => {
                if (data !== "" && data != null) {
                  handleInputChange("charger", "yes");
                } else {
                  handleInputChange("charger", "no");
                }
                handleInputChange("charger_number", data)
              }}
              onObjectSelect={() => { }}
              config={{
                type: 'charger', valueKey: 'id', source: 'chargeserialnumber',
                getLabel: (item) => `${item.charger_serial_no}`,
                getValue: (item) => item.id,
                placeholder: 'Select Charger',
                list: "id,charger_serial_no",
                allowAddNew: true, preload: true, cache: true, showRecent: true, multi: false
              }} />
          </div>
        </div>
        {/* Additional Items */}
        <div className="col-span-4 grid grid-cols-4 gap-6">
          <div className="col-span-2">
            <div className="flex-1 relative">
              <label className="block text-gray-600 mb-1 text-sm">Accessories</label>
              <SmartSelectInput
                id="accessories" label="" value={data?.accessories}
                onSelect={(data) => {
                  handleInputChange("accessories", data)
                }}
                onObjectSelect={() => { }}
                config={{
                  type: 'category', valueKey: 'category_id', source: 'asset_lists',
                  getLabel: (item) => `${item.categoryName}`,
                  getValue: (item) => item.category_id,
                  placeholder: 'Select Accessories',
                  list: "categoryName,category_id",
                  allowAddNew: true, preload: true, cache: true, showRecent: true, multi: true
                }} />
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-gray-600 mb-1 text-sm">Billing Type</label>
            <select
              name="billing_type"
              className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10"
              value={data.billing_type}
              onChange={handleChange}
            >
              <option value="day">Day Wise</option>
              <option value="monthly">Monthly</option>
              <option value="contract">Contract Period</option>
            </select>
            {data.billing_type === "contract" &&
              (
                <div className="grid mt-2 grid-cols-4 gap-2">
                  <div className="col-span-2">
                    <DatePicker
                      selected={data?.contract_start}
                      onChange={(date) => handleInputChange('contract_start', date?.toISOString())}
                      className="ws-date w-full form-input w-full text-gray-600 bg-gray-100 rounded focus:outline-none px-3 py-2 px-2 py-1 text-sm"
                      placeholderText="Start"
                      dateFormat="yyyy-MM-dd"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      calendarClassName="custom-datepicker-calendar"
                    />
                  </div>
                  <div className="col-span-2">
                    <DatePicker
                      selected={data?.contract_end}
                      onChange={(date) => handleInputChange('contract_end', date?.toISOString())}
                      className="ws-date w-full form-input w-full text-gray-600 bg-gray-100 rounded focus:outline-none px-3 py-2 px-2 py-1 text-sm"
                      placeholderText="End"
                      dateFormat="yyyy-MM-dd"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      calendarClassName="custom-datepicker-calendar"
                    />
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
