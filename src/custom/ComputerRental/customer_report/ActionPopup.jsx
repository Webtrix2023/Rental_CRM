import React, { useState, useEffect } from "react";
import { RotateCcw, ArrowUpDown, ArrowUpFromLine } from "lucide-react";
import { fetchJson } from "@utils/fetchJson";
import { SmartSelectInput } from "@components/index";
import { API_BASE_URL } from "@config";
import { toast } from "react-toastify";
import { defaultReplaceModel, defaultUpgradeModel, defaultReturnModel } from "./API/ReportSchema";



export const ActionPopup = ({ not_replacement, itemRow, itemID, customer_id, invoice_id, product_id, action, isOpen, onClose, onSubmit, refreshCustomerReport }) => {

  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(null);
  const [product_details, setProductDetails] = useState({});

  async function parseProductDetails(itemRow) {
    const details = await new Promise((resolve, reject) => {
      try {
        const parsed = itemRow.productDetailsObject ? JSON.parse(itemRow.productDetailsObject) : {};
        resolve(parsed);
      } catch (error) {
        reject(error); // handle invalid JSON
      }
    });

    setProductDetails(details);
  }

  useEffect(() => {
    if (!isOpen) return;
    setProductDetails(itemRow.productDetailsObject ? JSON.parse(itemRow.productDetailsObject) : {})
    const product = itemRow.productDetailsObject ? JSON.parse(itemRow.productDetailsObject) : {};
    console.log('product 1 : ', product);
    switch (action) {
      case 'return':
        setPayload(defaultReturnModel);
        break;
      case 'upgrade':
        setPayload(defaultUpgradeModel);
        break;
      case 'replace':
        setPayload(defaultReplaceModel);
        break;
      default:
        setPayload(null);
    }
    console.log('product_details.hdd_capacity:', product.hdd_capacity);
    console.log('product_details.memory:', product.memory);
    console.log('product_details.operating_system:', product.operating_system);
    console.log('product_details.screensize:', product.screensize);

    setPayload((prev) => ({
      ...prev,
      ['customer_id']: customer_id,
      ['itemID']: itemID,
      ['invoice_id']: invoice_id,
      ['product_id']: product_id,
      ['old_hdd_capacity']: product.hdd_capacity || null,
      ['old_memory']: product.memory || null,
      ['old_operating_system']: product.operating_system || null,
      ['old_screensize']: product.screensize || null,
    }));
    console.log('payload 1 : ', payload);

  }, [isOpen, action]);

  if (!isOpen) return null;

  const isDateValid = (date) => {
    if (!date) return false;
    const d = new Date(date);
    const today = new Date();
    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return d.getTime() === today.getTime();
  };
  const handleInputChange = (field, value) => {
    setPayload((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const isConfigChanged = (payload) => {
    const fields = ["screensize", "operating_system", "memory", "hdd_capacity"];
    return fields.some((field) => payload[field] !== null);
  };
  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  const handleSave = async () => {
    // Simple validation
    if (action === "return") {
      if (!payload?.return_date || !payload?.reason) {
        toast.error("Please fill all required return fields.");
        return;
      }
      if (!isDateValid(payload?.return_date)) {
        toast.error("Return Date date cannot be in the past and future.");
        return;
      }
    }

    if (action === "upgrade") {
      if (!payload?.upgrade_date || !payload?.charges_apply_from || !payload?.upgrade_charges) {
        toast.error("Please fill all required upgrade fields.");
        return;
      }
      if (payload?.upgrade_charges <= 0) {
        toast.error("Upgrade charges should be positive.");
        return;
      }
      if (!isConfigChanged(payload)) {
        toast.error("Please select any upgrade.");
        return;
      }
      if (!isDateValid(payload?.upgrade_date)) {
        toast.error("Upgrade Date date cannot be in the past and future.");
        return;
      }
    }

    if (action === "replace") {
      if (!payload?.replace_date) {
        toast.error("Please fill all required replace fields.");
        return;
      }
      if (!isDateValid(payload?.replace_date)) {
        toast.error("Replace Date date cannot be in the past and future.");
        return;
      }
    }
    setLoading(true);
    const res = await fetchJson(`${API_BASE_URL}/rental/product-action/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (res?.flag === "S") {
      onClose();
      toast.success(`Item ${action}ed !`);
      refreshCustomerReport()
    } else {
      toast.error(`Error while updating item (${res.status})`);
    }
  };

  console.log('product_details :', product_details);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#8f8f8fab] bg-opacity-40 px-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>
        <div className="flex items-center mb-6">
          <div className="bg-orange-100 text-orange-600 p-2 rounded-full mr-3">
            {action == "replace" && <ArrowUpDown size={18} />}
            {action == "return" && <RotateCcw size={18} />}
            {action == "upgrade" && <ArrowUpFromLine size={18} />}
          </div>
          <div>
            <h2 className="text-lg font-semibold">Product {action || "-"}</h2>
            <p className="text-sm text-gray-500">
              Add {action || "-"} details for rental equipment
            </p>
          </div>
        </div>

        {loading && <h1 className="text-center">Loading...</h1>}
        {!loading && (
          <form className="space-y-4" target="#">

            {/* RETURN PRODUCT FORM */}
            {action == 'return' &&
              <div>
                <label className="text-sm font-medium text-gray-700"> GRN (Document No.)<span className="text-red-500"></span> </label>
                <input type="text" placeholder="Enter GRN document number" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required onChange={(e) => { handleInputChange('gr_no', e.target.value); }} />
              </div>
            }

            <div>
              <label className="text-sm font-medium text-gray-700">{capitalize(action)} Date<span className="text-red-500">*</span></label>
              <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={payload?.[action + "_date"] || ""} required onChange={(e) => { handleInputChange(`${action}_date`, e.target.value); }} />
            </div>

            {action == 'return' &&
              <div>
                <label className="text-sm font-medium text-gray-700">Return Reason<span className="text-red-500">*</span></label>
                <SmartSelectInput
                  id="reason" label="" value={''}
                  onSelect={(data) => {
                    handleInputChange("reason", data)
                  }}
                  onObjectSelect={() => { }}
                  config={{
                    type: 'category', valueKey: 'category_id', source: 'reason',
                    getLabel: (item) => `${item.categoryName}`,
                    getValue: (item) => item.categoryName,
                    placeholder: 'Select Reason',
                    list: "categoryName,category_id",
                    allowAddNew: false, preload: true, cache: true, showRecent: true
                  }}
                />
              </div>
            }

            {/* UPGRADE PRODUCT FORM */}
            {action == 'upgrade' &&
              <>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <label className="text-sm font-medium text-gray-700">HDD Capacity</label>
                    <SmartSelectInput
                      id="hdd_capacity" label="" value={product_details?.hdd_capacity}
                      onSelect={(data) => {
                        handleInputChange("hdd_capacity", data)
                      }}
                      onObjectSelect={() => { }}
                      config={{
                        type: 'category', valueKey: 'category_id', source: 'hdd_capacity',
                        getLabel: (item) => `${item.categoryName}`,
                        getValue: (item) => item.category_id,
                        placeholder: 'Select HDD Capacity',
                        list: "categoryName,category_id",
                        allowAddNew: false, preload: true, cache: true, showRecent: true
                      }}
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="text-sm font-medium text-gray-700">Memory</label>
                    <SmartSelectInput
                      id="memory" label="" value={product_details?.memory}
                      onSelect={(data) => {
                        handleInputChange("memory", data)
                      }}
                      onObjectSelect={() => { }}
                      config={{
                        type: 'category', valueKey: 'category_id', source: 'memory',
                        getLabel: (item) => `${item.categoryName}`,
                        getValue: (item) => item.category_id,
                        placeholder: 'Select Memory',
                        list: "categoryName,category_id",
                        allowAddNew: false, preload: true, cache: true, showRecent: true
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <label className="text-sm font-medium text-gray-700">Operating System</label>
                    <SmartSelectInput
                      id="operating_system" label="" value={product_details?.operating_system}
                      onSelect={(data) => {
                        handleInputChange("operating_system", data)
                      }}
                      onObjectSelect={() => { }}
                      config={{
                        type: 'category', valueKey: 'category_id', source: 'operating_system',
                        getLabel: (item) => `${item.categoryName}`,
                        getValue: (item) => item.category_id,
                        placeholder: 'Select Operating System',
                        list: "categoryName,category_id",
                        allowAddNew: false, preload: true, cache: true, showRecent: true
                      }}
                    />
                  </div>
                  {/* <div className="w-full md:w-1/2">
                    <label className="text-sm font-medium text-gray-700">Screen Size</label>
                    <SmartSelectInput
                      id="screensize" label="" value={product_details?.screensize}
                      onSelect={(data) => {
                        handleInputChange("screensize", data)
                      }}
                      onObjectSelect={() => { }}
                      config={{
                        type: 'category', valueKey: 'category_id', source: 'screensizes',
                        getLabel: (item) => `${item.categoryName}`,
                        getValue: (item) => item.category_id,
                        placeholder: 'Select Screen Size',
                        list: "categoryName,category_id",
                        allowAddNew: false, preload: true, cache: true, showRecent: true
                      }}
                    />
                  </div> */}
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-1/2">
                    <label className="text-sm font-medium text-gray-700"> Charges <span className="text-red-500">*</span> </label>
                    <input type="number" min="0" placeholder="Enter upgrade charges" className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required onChange={(e) => { handleInputChange('upgrade_charges', e.target.value); }} />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="text-sm font-medium text-gray-700"> Charges Apply From <span className="text-red-500">*</span> </label>
                    <select id="charges_apply_from" className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={payload?.charges_apply_from || ""}
                      onChange={(e) => {
                        handleInputChange("charges_apply_from", e.target.value)
                      }}
                    >
                      <option value="this_month" >This Month</option>
                      <option value="next_month" >Next Month</option>
                    </select>
                  </div>
                </div>
              </>
            }

            {/* REPLACE PRODUCT FORM */}
            {action == 'replace' &&
              <div className="">
                <label className="text-sm font-medium text-gray-700">Select Replacement<span className="text-red-500">*</span></label>
                <select className="ws-input form-input w-full text-gray-600 text-md bg-gray-100 rounded focus:outline-none text-sm px-3 py-2 pr-10 rounded" name="Charges apply from" onChange={(e) => { handleInputChange('replaced_row_id', e.target.value); }}>
                  <option value=''>Select Replacement</option>
                  {not_replacement && not_replacement.map((item, index) => {
                    const product = item.productObject ? JSON.parse(item.productObject) : null;
                    return (product &&
                      <option key={index} value={item.itemID}>{`${product.product_name || ''} (${product.product_serial_no || '-'})`}</option>
                    )
                  })}
                </select>
              </div>}
            <div>
              <label className="text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea placeholder={`Add any additional notes about the ${action}...`} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} onChange={(e) => { handleInputChange('remark', e.target.value); }}></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">Cancel </button>
              <button type="submit" className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700" onClick={(e) => {
                e.preventDefault();
                handleSave();
              }} >
                Save {action} </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default {
  ActionPopup,
};
