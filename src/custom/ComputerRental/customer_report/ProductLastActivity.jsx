import React, { useState, useEffect, useRef } from "react";
import { ClockAlert, Laptop, LaptopMinimal, Smartphone, Plus, Truck, RotateCcw } from "lucide-react";
import { fetchJson } from "@utils/fetchJson";
import ProductSearchInput from "../Delivery/ProductSearchInput";
import { API_BASE_URL } from "@config";

// PLACEHOLDERS for missing utilities
const TimelineDot = ({ color }) => <div className={`w-3 h-3 rounded-full ${color} mr-2`} />;
const Note = ({ note }) => note ? <div className="text-gray-500 text-sm mt-2">{note}</div> : null;
const TIMELINE_COLORS = { add: "bg-blue-500", delivered: "bg-green-500", returned: "bg-red-500", replaced: "bg-red-500" };
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr.replace(/-/g, "/"));
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" });
}
export const ProductLastActivity = ({ product_id, text, color, textColor }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [productId, setProductId] = useState(product_id);
  const [history, setHistory] = useState([]);
  const [product_details, setProductDetails] = useState({});


  function safeParse(obj) {
    if (!obj || obj === 'null' || obj === '') return null;
    if (typeof obj === 'object') return obj;
    try { return JSON.parse(obj); } catch { return null; }
  }
  console.log('product', product);
  const config = [
    { "model_name": "Model Name" },
    { "processor": "Processor" },
    { "memory": "Memory" },
    { "hdd_capacity": "HDD Capacity" },
    { "screensize": "Screen Size" },
    { "operating_system": "Operating System" },
  ];
  const configString = [
    product?.model_name && `${product.model_name} ${product.model_name}`,
    product?.processor && `${product.processor} ${product.generation}`,
    product?.memory && `${product.memory} RAM`,
    product?.hdd_capacity,
    product?.screensize && `${product.screensize} Display`,
    product?.operating_system
  ].filter(Boolean).join(" | ");

  useEffect(() => {
    if (!open || !productId) return;
    setLoading(true);
    fetchJson(`${API_BASE_URL}/productLastActivity/${productId}`, { method: 'get' })
      .then((data) => {
        setLoading(false);
        if (data.flag === "S") {
          setProduct(data.data.product_details);
          setHistory(data.data.product_history || []);
        }
      });
  }, [productId, open]);

  const Activity = ({ history }) => {
    let steps = [];
    if (!history) return null;

    // --- steps logic (unchanged) ---
    // Ensure icons (Plus, Truck, RotateCcw) are imported
    if (history.action === "add") {
      steps.push({
        type: "add",
        title: "Added to Inventory",
        icon: (
          <div className="bg-blue-600 text-white p-1.5 rounded-full flex items-center justify-center">
            <Plus size={9} strokeWidth={4} />
          </div>
        ),
        desc: (
          <>
            <span>Product purchased and added to rental inventory</span>
          </>
        ),
        date: formatDate(history.created_date),
        meta: { condition: "New" },
      });
    } else if (history.action === "delivered") {
      steps.push({
        type: "delivered",
        title: (history.is_first_rental == 'y') ? "First Delivery" : 'Delivered',
        icon: (
          <div className="rounded-full flex items-center justify-center">
            <Truck size={20} fill="green" strokeWidth={0} />
          </div>
        ),
        desc: (
          <>
            Delivered to {history.customer_name || "Unknown Customer"}
          </>
        ),
        date: formatDate(history.created_date),
        meta: {},
      });
    } else if (history.action === "returned") {
      steps.push({
        type: "returned",
        title: "Returned to Inventory",
        icon: (
          <div className="text-red-500 rounded-full flex items-center justify-center">
            <RotateCcw size={17} strokeWidth={3} />
          </div>
        ),
        desc: (
          <>
            Product returned from {history.customer_name || "Customer"}
          </>
        ),
        date: formatDate(history.returned_date || history.created_date),
        meta: { condition: "Good" },
        note: <Note note={history.note} />,
      });
    } else if (history.action === "replace") {
      steps.push({
        type: "replaced",
        title: "Returned to Inventory",
        icon: (
          <div className="text-red-500 rounded-full flex items-center justify-center">
            <RotateCcw size={17} strokeWidth={3} />
          </div>
        ),
        desc: (
          <>
            Product replaced with {history.replaced_product && <span className="text-red-500"> {history.replaced_product?.product_name || ''} ({history.replaced_product?.product_serial_no || '-'})</span>} by {history.customer_name || "Customer"}
          </>
        ),
        date: formatDate(history.returned_date || history.created_date),
        meta: { condition: "Good" },
        note: <Note note={history.note} />,
      });
    }

    return (
      <div className="max-w-5xl mx-auto mt-6 px-3 md:px-1 py-1 md:py-2">
        <div className="relative">
          {steps.length === 0 && <div className="text-gray-400 text-center py-8">No events</div>}
          <ul className="">
            {steps.map((event, idx) => (
              <li key={idx} className="relative flex items-start">
                <div className="flex-1 bg-white-700 rounded-lg px-3 py-3 shadow-sm">
                  <div className="font-semibold flex items-center justify-between space-x-2 w-full px-2">
                    <div className="flex items-center space-x-2">{event.icon}<span>{event.title}</span></div>
                    <div className="font-inter font-normal text-sm text-gray-400 text-right">{event.date}</div>
                  </div>
                  <div className="font-inter text-[14px] p-1.5 text-[#5F6A6A]">{event.desc}</div>
                  <div className="p-1.5 font-inter text-[14px] text-[#000000] flex items-center space-x-2 w-full">{event.footer}</div>
                  {event.note}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={`flex items-center justify-center gap-2 px-4 py-2 w-3xs ${color} text-white rounded-lg shadow hover:bg-blue-400 transition`}>
        <ClockAlert size={24} color="#ffffff" />
        <span>{text}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#8f8f8fab] bg-opacity-40 px-4">
          <div className="bg-gray-50 w-full max-w-xl rounded-xl shadow-lg p-6 relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => { setOpen(false); setProductId(null); setHistory([]); setProduct(null) }}>
              ✕
            </button>

            <div className="flex items-center mb-6">
              <div className="bg-orange-100 text-orange-600 p-2 rounded-full mr-3">
                <ClockAlert size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{text}</h2>
                <p className="text-sm text-gray-500">{text || "-"} details for rental equipment</p>
              </div>
            </div>

            <div className="max-w-5xl mx-auto gap-3 md:gap-8 mt-8 px-1 py-4">
              <ProductSearchInput value={safeParse(product)} stockCheckDisable={true} onChange={(prod) => { if (prod) setProductId(prod.product_id); }} />
            </div>

            {loading && <h1 className="text-center">Loading...</h1>}
            {!loading && product && (
              <>
                <div className="flex justify-between mt-7">
                  <div className="flex gap-4">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
                      {product.product_type === 'Laptop' && <Laptop size={50} strokeWidth={3} />}
                      {product.product_type === 'Desktop' && <LaptopMinimal size={50} strokeWidth={3} />}
                      {product.product_type === 'Mobile' && <Smartphone size={50} strokeWidth={3} />}
                    </div>
                    <div className="flex flex-col">
                      <div className="font-bold text-lg md:text-xl">{product.product_name || '-'}</div>
                      <div className="text-gray-500 text-sm mt-0.5">Serial: <span className="font-mono">{product.product_serial_no || '-'}</span></div>
                      <div className="text-xs text-gray-400">Product ID: {product.product_id || '-'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {product.current_status === 'on_rent' && (
                      <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                        On Rent
                      </span>
                    )}
                    {product.current_status === 'sold' && (
                      <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-orange-100 font-semibold text-xs">
                        Sold
                      </span>
                    )}
                    {(!product.current_status || product.current_status === 'in_inventory') && (
                      <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-xs">
                        In Inventory
                      </span>
                    )}
                    {(!product.current_status || product.current_status === 'damaged') && (
                      <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs">
                        Damaged
                      </span>
                    )}
                    {(!product.current_status || product.current_status === 'in_maintenance') && (
                      <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-xs">
                        In Maintenance
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {product &&
                    config.map((item, idx) => {
                      const key = Object.keys(item)[0];   // e.g. "model_name"
                      const label = item[key];            // e.g. "Model Name"

                      return (
                        product[key] && (
                          <span key={idx} className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-xs font-medium">
                            {label} : {product[key]}
                          </span>
                        )
                      );
                    })}
                </div>
                <div className="mt-4"><Activity history={history[0] || {}} /></div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductLastActivity;
