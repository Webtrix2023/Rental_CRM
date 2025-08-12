import { API_BASE_URL } from "../../../config";
import React,{useState,useRef} from "react";
import AsyncSelect from "react-select/async";
import { useClickOutside } from "./useClickOutside"; 

// Two-line, compact card

function ProductCard({ product, onChange }) {
  return (
    <div
      className="bg-blue-50 rounded-lg border border-blue-200 px-3 py-2 flex items-start gap-3 cursor-pointer relative min-h-[42px]"
      onClick={onChange}
      tabIndex={0}
      title="Click to change product"
      style={{ fontSize: "0.98rem" }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 text-blue-900 font-semibold leading-tight">
          <span className="truncate">{product.product_name}</span>
          <span className="text-xs text-gray-500 font-normal ml-1">{product.product_serial_no}</span>
          {product.qtyBalance && (
            <span className="text-xs text-gray-500 ml-1">Stock: {product.qtyBalance}</span>
          )}
          {product.processor && (
            <span className="text-xs text-gray-500 ml-1">{product.processor}</span>
          )}
        </div>
        <div className="text-xs text-gray-500 leading-tight truncate">
          {[
            product.productName,
            product.modelName,
            product.memory,
            product.HDDCapacity,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
      <span className="text-xs text-blue-500 font-medium underline ml-2 shrink-0">
        Change
      </span>
    </div>
  );
}

function ProductOption(props) {
  const { data, innerProps, innerRef, isDisabled } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={`px-3 py-2 rounded cursor-pointer ${
        isDisabled ? "opacity-40 cursor-not-allowed bg-gray-100" : "hover:bg-blue-50"
      }`}
    >
      <div className="font-medium text-gray-800 flex items-center gap-2">
        <span>{data.product_name}</span>
        <span className="text-xs text-gray-400">({data.processor || "-"})</span>
        <span className="text-xs text-blue-500 ml-2">
          {data.product_serial_no}
          <span className="ml-2 text-gray-400">
            Stock: <b>{data.qtyBalance}</b>
          </span>
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1 truncate">
        {[data.productName, data.modelName, data.memory, data.HDDCapacity]
          .filter(Boolean)
          .join(" · ")}
      </div>
      {isDisabled && (
  <div className="text-xs text-red-400 font-medium mt-1">
    {data.qtyBalance === "0" || data.qtyBalance === 0
      ? "No stock available"
      : "Already selected"}
  </div>
)}
    </div>
  );
}

export default function ProductSearchInput({
  value,
  onChange,
  disabledProductIds = [],
  stockCheckDisable=false,
  placeholder = "Search and select product",
}) {
  const [editing, setEditing] = useState(!value);
  const containerRef = useRef();
  //console.log("stockCheckDisable",stockCheckDisable);
  // Use the custom hook to handle outside clicks
  useClickOutside(containerRef, () => {
    // If we're in editing mode, and a value is already selected, close edit mode
    if (editing) setEditing(false);
  });

  const loadOptions = async (inputValue) => {
      console.log("stockCheckDisable",stockCheckDisable);
    if (!inputValue || inputValue.length < 1) return [];
    const res = await fetch(
      `${API_BASE_URL}/rentalgetSearchedProduct`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputValue }),
      }
    );
    const data = await res.json();
    if (data.flag !== "S" || !data.data) return [];
    // return data.data.map((opt) => ({
    //   ...opt,
    //   isDisabled:
    //     disabledProductIds.includes(opt.product_id) ||
    //     opt.qtyBalance === "0" ||
    //     opt.qtyBalance === 0,
    // }));
     return data.data.map((opt) => ({
    ...opt,
    // isDisabled:
    //   (disabledProductIds.includes(opt.product_id) && opt.product_id !== value?.product_id) ||
    //   opt.qtyBalance === "0" ||
    //   opt.qtyBalance === 0,
    isDisabled : stockCheckDisable ? false : (
    (disabledProductIds.includes(opt.product_id) && opt.product_id !== value?.product_id)
    // Not in inventory status
    || opt.current_status !== 'in_inventory'
    // In inventory but no stock
    || Number(opt.qtyBalance) < 1)
  }));
  };

  if (!editing && value) {
    return (
      <div ref={containerRef} className="relative group">
        <ProductCard product={value} onChange={() => setEditing(true)} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <AsyncSelect
        classNamePrefix="product-search"
        placeholder={placeholder}
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        value={value}
        getOptionLabel={(option) =>
          option.product_name +
          (option.product_serial_no ? ` (${option.product_serial_no})` : "")
        }
        getOptionValue={(option) => option.product_id}
        onChange={(prod) => {
          setEditing(false);
          onChange(prod);
        }}
        components={{
          Option: (props) => <ProductOption {...props} />,
        }}
        isOptionDisabled={(option) => !!option.isDisabled}
        styles={{
          control: (provided) => ({
            ...provided,
            minHeight: "38px",
            background: "#f3f4f6",
            borderRadius: "0.5rem",
            fontSize: "0.97rem",
            borderColor: "#e5e7eb",
            boxShadow: "none",
          }),
          option: (provided, state) => ({
            ...provided,
            padding: "10px 12px",
            fontSize: "0.98rem",
            color: state.isDisabled ? "#888" : provided.color,
            backgroundColor: state.isSelected
              ? "#dbeafe"
              : state.isFocused
              ? "#f1f5f9"
              : "white",
          }),
        }}
        noOptionsMessage={() => "No product found"}
        isClearable
        autoFocus
      />
    </div>
  );
}