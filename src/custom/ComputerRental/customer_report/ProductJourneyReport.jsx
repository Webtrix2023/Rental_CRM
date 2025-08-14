import { API_BASE_URL } from "@config";
import { Plus ,BadgeQuestionMark ,Truck , ArrowUp ,RotateCcw,Laptop,LaptopMinimal,Smartphone} from "lucide-react";
import { fetchJson } from "@utils/fetchJson";
import ProductSearchInput from "../Delivery/ProductSearchInput";
import React, { useEffect, useState , useRef } from "react";
import { SmartSelectInput } from "@components/index";
// Utility
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr.replace(/-/g, "/"));
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" });
}
function safeParse(obj) {
  if (!obj || obj === 'null' || obj === '') return null;
  if (typeof obj === 'object') return obj;
  try {
    return JSON.parse(obj);
  } catch {
    return null;
  }
}
function TimelineDot({ color }) {
  return (
    <span className={`inline-block w-3 h-3 rounded-full mr-3 ${color}`} />
  );
}

// Timeline colors (by type/action)
const TIMELINE_COLORS = {
  add: "bg-blue-500",
  delivered: "bg-green-500",
  returned: "bg-red-500",
  upgrade: "bg-orange-500",
  config: "bg-yellow-500",
  on_rent: "bg-blue-400",
  other: "bg-gray-300",
};

function ProductJourneyReport({product_id}) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const formRef = useRef(null);
  const [productId, setProductId] = useState(product_id);
  const handleExport = (e) => {
    e.preventDefault();    
    const type = e.target.getAttribute("data-type");    
    const form = formRef.current;

    if (!form) return;

    let dataInput = form.querySelector("input[name='data']");
    if (!dataInput) {
      dataInput = document.createElement("input");
      dataInput.type = "hidden";
      dataInput.name = "data";
      form.appendChild(dataInput);
    }
    const bodyJson = {
      "type" : type
    };
    dataInput.value = JSON.stringify(bodyJson);
    form.action = `${API_BASE_URL}/exportProductReport/${productId}`;
    form.method = "POST";
    form.target = "_blank";

    form.submit();

    setTimeout(() => {
        form.action = "#";
        form.method = "POST";
        form.target = "";
    }, 100);
  };

  useEffect(() => {
    if (!productId) { return }
    setLoading(true);
    fetchJson(`${API_BASE_URL}/productHistory/${productId}`,{
        method:'get'
    })
      .then((res) => res)
      .then((data) => {
        if (data.flag === "S") {
          setProduct(data.data.product_details);
          // Construct timeline array
          const product_details = data.data.product_details || [];
          const hist = data.data.product_history || [];
          // 1. Add 'Added to Inventory'
          let steps = [];
          hist.reverse();
          hist.forEach((h) => {
            if (h.action === "add") {
              steps.push({
                type: "add",
                title: "Added to Inventory",
                icon : (
                  <div className="bg-blue-600 text-white p-1.5 rounded-full flex items-center justify-center">
                    <Plus size={9} strokeWidth={4} />
                  </div>  
                ),
                desc: (
                  <>
                    <span>Product purchased and added to rental inventory</span>
                  </>
                ),
                date: formatDate(h.created_date),
                meta: { condition: "New" },
                footer: (
                  <>
                    {console.log('product_details : ',product_details)}
                    <div className="flex-1">Purchase Price : ₹ {product_details?.purchase_price ?? '-'}</div>
                  </>
                ),
              });
            } else if (h.action === "delivered") {
              steps.push({
                type: "delivered",
                title: (h.is_first_rental == 'y') ? "First Delivery" : 'Delivered',
                icon : (
                  <div className="rounded-full flex items-center justify-center">
                    <Truck size={20} fill="green" strokeWidth={0} />
                  </div>  
                ),
                desc: (
                  <>
                    Delivered to {h.customer_id || "Unknown Customer"}           
                  </>
                ),
                date: formatDate(h.invoiceDate),
                meta: {},
                footer: (
                  <>
                    <div className="flex-1">Delivery Challan : {h.invoiceNumber || "-"}</div>
                    <div className="flex-1">Monthly Rate :   ₹{h.rate}</div>
                    <div className="flex-1">Customer :   {h.customer_id || "Unknown Customer"}</div>
                  </>
                ),
              });
            } else if (h.action === "returned") {
              steps.push({
                type: "returned",
                title: "Returned to Inventory",
                icon : (
                  <div className="text-red-500 rounded-full flex items-center justify-center">
                    <RotateCcw size={17} strokeWidth={3} />
                  </div>  
                ),
                desc: (
                  <>
                    Product returned from {h.customer_id || "Customer"}
                  </>
                ),
                date: formatDate(h.returned_date || h.created_date),
                meta: { condition: "Good" },
                footer: (
                  <>
                    <div className="flex-1">Rental Days : {h.rental_days || 0}</div>
                    {/* <div className="flex-1">Revenue :   ₹{h.revenue || 0}</div>
                    <div className="flex-1">Condition :   {h.condition || "Good"}</div> */}
                  </>
                ),
              });
            } else if (h.old_configuration || h.new_configuration) {
              steps.push({
                type: "config",
                title: `Configuration Change: ${h.configuration}`,
                icon : (
                  <div className="text-yellow-500 p-1 rounded-full flex items-center justify-center">
                    <ArrowUp size={20} strokeWidth={3} />
                  </div>  
                ),
                desc: (
                  <>
                    {(h.old_configuration || h.new_configuration) && (
                      <>
                        {h.old_configuration ? (
                          <>
                            {console.log('h.new_configuration :',h.new_configuration)}
                            Changed from {h.old_configuration} to {h.new_configuration ?? " - "}
                          </>
                        ) : (
                          <>
                            Set to {h.new_configuration}
                          </>
                        )}
                      </>
                    )}
                  </>
                ),
                footer: (
                   <>
                    {h.charges && <div className="flex-1">Upgrade Cost :   ₹{h.charges || 0}</div>}
                    {h.charges && <div className="flex-1">New Rate :   ₹{h.charges || 0}</div>}
                    {h.charges_apply_from && <div className="flex-1">Effective From : {h.charges_apply_from || "-"}</div>}
                  </>
                ),
                date: formatDate(h.created_date),
                meta: {},
              });
            } 
            // else {
            //   // Other actions, just in case
            //   steps.push({
            //     type: "other",
            //     title: h.action || "Event",
            //     icon : (
            //       <div className="bg-blue-600 text-white p-1.5 rounded-full flex items-center justify-center">
            //         <BadgeQuestionMark size={9} strokeWidth={3} absoluteStrokeWidth />
            //       </div>  
            //     ),
            //     desc: "",
            //     date: formatDate(h.created_date),
            //     meta: {},
            //     footer: (
            //       <>
            //         Changed from <b>{h.old_configuration}</b> to <b>{h.new_configuration}</b>
            //       </>
            //     ),
            //   });
            // }
          });
          setTimeline(steps);
        }
        setLoading(false);
      });
  }, [productId]);

  // Fake stats (replace with real calculations as needed)
  const stats = {
    totalRentalDays: 487,
    totalRevenue: 58440,
    rentalCycles: 3,
    utilizationRate: 78,
    status: "On Rent",
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen p-0">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#f8fafc] flex flex-col md:flex-row md:items-center md:justify-between px-3 md:px-8 py-6 border-b">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Product Journey Report</h1>
          <div className="text-gray-400 mt-1 text-base">
            Complete lifecycle tracking from inventory to return
          </div>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          {/* <button className="bg-gray-200 hover:bg-gray-300 text-gray-600 px-4 py-2 rounded font-semibold text-sm flex items-center gap-2">
          <span>Table View</span>
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-semibold text-sm flex items-center gap-2">
          <span>Timeline View</span>
          </button> */}
        </div>
      </div>
              
        <div className="max-w-5xl mx-auto gap-3 md:gap-8 mt-8 bg-white shadow rounded-xl px-3 md:px-8 py-5 md:py-7 items-center">
            <div className="grid grid-cols-7 gap-3">
                <div className="col-span-3">
                  <ProductSearchInput
                    value={safeParse(product)} 
                    stockCheckDisable={true}
                    onChange={(prod) =>{
                      if (prod) {
                        setProductId(prod.product_id)
                      }
                    } }/>
                </div>
              </div>
        </div>
      {/* Product Summary Card */}
      {product && (
        <div className="max-w-5xl mx-auto gap-3 md:gap-8 mt-8 bg-white shadow rounded-xl px-3 md:px-8 py-5 md:py-7 items-center">
          {/* Product Info (left section) */}
          <div>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="flex justify-between items-center gap-4">
                  {/* Left: Product Icon and Info */}
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
                      {product.product_type === 'Laptop' && <Laptop size={50} strokeWidth={3} absoluteStrokeWidth />}
                      {product.product_type === 'Desktop' && <LaptopMinimal size={50} strokeWidth={3} absoluteStrokeWidth />}
                      {product.product_type === 'Mobile' && <Smartphone size={50} strokeWidth={3} absoluteStrokeWidth />}
                    </div>
                    <div className="flex flex-col">
                      <div className="font-bold text-lg md:text-xl">{product.product_name || '-'}</div>
                      <div className="text-gray-500 text-sm mt-0.5">
                        Serial: <span className="font-mono">{product.product_serial_no || '-'}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Product ID: {product.product_id || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Right: Product Status */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">Current Status:</span>
                    {product.current_status === 'on_rent' && (
                      <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
                        On Rent
                      </span>
                    )}
                    {(!product.current_status || product.current_status === 'in_inventory') && (
                      <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold text-xs">
                        In Inventory
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500">Total Rental Days</div>
                <div className="font-bold text-lg">{product.total_rental_days || 0} Days</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Total Revenue</div>
                <div className="font-bold text-green-600 text-lg">
                  ₹ {product.total_revenues || 0}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Rental Cycles</div>
                <div className="font-bold text-blue-600 text-lg">
                  {product.rental_cycles || 0}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Utilization Rate</div>
                <div className="font-bold text-orange-600 text-lg">
                  {product.utilization_rate || 0}%
                </div>
              </div>
            </div>

            {/* Current Status */}

          </div>
        </div>
      )}

      {/* Timeline Section */}
      <div className="max-w-5xl mx-auto mt-6 bg-white rounded-xl shadow px-3 md:px-8 py-5 md:py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold text-lg">Product Journey Timeline</div>
          {timeline.length !== 0 && (
          <form ref={formRef}>
            <div className="flex gap-0.5 items-center">
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold text-sm flex items-center gap-2" data-type="pdf" onClick={handleExport}>
                Export Pdf
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm flex items-center gap-2" data-type="excel" onClick={handleExport}>
                Export Excel
              </button>
            </div>
          </form>)}
        </div>
        <div className="relative pl-5">
          <div className="absolute top-0 left-2 w-0.5 bg-gray-200 h-full" />
          {timeline.length === 0 && (
            <div className="text-gray-400 text-center py-8">No events</div>
          )}
          <ul className="space-y-6">
            {timeline.map((event, idx) => (
              <li key={idx} className="relative flex items-start">
                <TimelineDot color={TIMELINE_COLORS[event.type] || "bg-gray-400"} />
                <div className="flex-1 bg-gray-50 rounded-lg px-3 py-3 shadow-sm">
                  <div className="font-semibold flex items-center justify-between space-x-2 w-full px-2">
                    <div className="flex items-center space-x-2">
                      {event.icon}
                      <span>{event.title}</span>
                    </div>
                    <div className="font-inter font-normal text-sm leading-5 tracking-normal text-gray-400 text-right">
                      {event.date}
                    </div>
                  </div>

                  <div className="font-inter font-normal text-[14px] leading-[12px] p-1.5 tracking-normal text-[#5F6A6A]">{event.desc}</div>
                  
                  <div className="p-1.5 font-inter font-normal tracking-normal text-[#000000] text-[14px]  leading-[12px] flex items-center space-x-2 w-full">
                    {event.footer}
                  </div>

                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8 mt-8 mb-10">
        <div className="bg-white rounded-xl shadow px-5 py-6">
          <div className="font-semibold mb-1">Revenue Breakdown</div>
          <div className="text-sm flex flex-col gap-1">
            <div className="flex justify-between"><span>First Rental ({product?.first_rental_days ?? 0 } days)</span><span>₹ {product?.first_rental_revenue ?? 0 }</span></div>
            <div className="flex justify-between"><span>Current Rental ({product?.current_rental_days ?? 0} days)</span><span>₹ {product?.current_rental_revenue ?? 0}</span></div>
          </div>
          <div className="mt-2 flex justify-between font-semibold">
            <span>Total Revenue</span>
            <span className="text-green-600">₹ {product?.total_revenues ?? 0}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow px-5 py-6">
          <div className="font-semibold mb-1">Utilization Stats</div>
          <div className="text-sm flex flex-col gap-1">
            <div className="flex justify-between"><span>Total Days</span><span>{product?.total_available_days ?? 0} days</span></div>
            <div className="flex justify-between"><span>Days on Rent</span><span>{ product?.total_rental_days ?? 0 } days</span></div>
            <div className="flex justify-between"><span>Idle Days</span><span>{ product?.idle_days ?? 0 } days</span></div>
            <div className="flex justify-between"><span>Utilization Rate</span><span className="text-orange-600">{ product?.utilization_rate ?? 0}%</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow px-5 py-6">
          <div className="font-semibold mb-1">Performance Metrics</div>
          <div className="text-sm flex flex-col gap-1">
            <div className="flex justify-between"><span>ROI to Date</span><span className="text-green-600">0 %</span></div>
            <div className="flex justify-between"><span>Avg Monthly Revenue</span><span>₹ 0</span></div>
            <div className="flex justify-between"><span>Rental Cycles</span><span> {product?.rental_cycles ?? 0} completed, {product?.ongoing ?? 0} ongoing</span></div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="max-w-5xl mx-auto text-gray-400 text-xs flex flex-col md:flex-row justify-between items-center pb-4 gap-2">
        <div>
          Product journey report generated on {new Date().toLocaleDateString()} at{" "}
          {new Date().toLocaleTimeString()}
        </div>
        <div>
          Equipment Rental Tracker {" "}
          <a href="mailto:support@webtrixsolutions.in" className="text-blue-500 underline">
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProductJourneyReport;
