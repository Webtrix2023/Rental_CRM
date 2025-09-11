import { IndianRupee, AlertCircle, Laptop,Monitor,Smartphone,Server,Printer,Camera,Box } from "lucide-react"; // Or use any icon lib
import { API_BASE_URL } from "@config";
import { fetchJson } from "@utils/fetchJson";
import { useState,useEffect } from "react";

export default function RevenueFinancials({
  revenueThisMonth = 123000,
  lastMonthRevenue = 99000,
  outstandingPayments = 15000,
}) {
  const productTypeIcons = {
    laptop: <Laptop className="w-6 h-6 text-gray-600" />,
    desktop: <Monitor className="w-6 h-6 text-gray-600" />,
    apple_tab: <Smartphone className="w-6 h-6 text-gray-600" />,
    printer: <Printer className="w-6 h-6 text-gray-600" />,
    server: <Server className="w-6 h-6 text-gray-600" />,
    camera: <Camera className="w-6 h-6 text-gray-600" />,
    default: <Box className="w-6 h-6 text-gray-600" />,
  };

  const [productTypesList, setProductTypesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const percentChange =
    lastMonthRevenue && lastMonthRevenue !== 0
      ? Math.round(((revenueThisMonth - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      const res = await fetchJson(`${API_BASE_URL}/productTypeStats`, {
        method: 'POST',
        body: JSON.stringify({})
      }
      );
      const data = res.data;
      setLoading(false);
      if (res.flag === "S") {
        setProductTypesList(data);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow p-6 w-full max-w-2xl flex flex-col gap-4">
      {/* <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[180px] bg-blue-50 rounded-lg flex items-center gap-4 p-4">
          <div className="bg-blue-500 text-white rounded-full p-3">
            <IndianRupee size={28} />
          </div>
          <div>
            <div className="text-sm text-gray-500">Revenue This Month</div>
            <div className="text-2xl font-bold text-blue-900">₹{revenueThisMonth.toLocaleString()}</div>
            <div className="text-xs mt-1 text-blue-700 font-medium">
              {percentChange >= 0 ? "▲" : "▼"} {Math.abs(percentChange)}% from last month
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-[180px] bg-red-50 rounded-lg flex items-center gap-4 p-4">
          <div className="bg-red-500 text-white rounded-full p-3">
            <AlertCircle size={28} />
          </div>
          <div>
            <div className="text-sm text-gray-500">Outstanding Payments</div>
            <div className="text-2xl font-bold text-red-700">₹{outstandingPayments.toLocaleString()}</div>
            <div className="text-xs mt-1 text-red-600 font-medium">Due & Overdue</div>
          </div>
        </div>
      </div> */}

      
      {/* Product Type Section */}
      <div className="mt-4">
        <div className="text-lg font-semibold text-gray-700 mb-2">Product Type</div>
         {loading &&
            <div className="flex justify-center items-center min-h-[200px]">
              <h1 className="text-center animate-pulse text-gray-500 text-lg">Loading...</h1>
            </div> 
          }
          {!loading && 
            <div className="flex flex-wrap gap-6">
              {productTypesList && productTypesList.map((item) => (
                <div key={item.category_id} className="flex flex-col items-center bg-gray-100 rounded-lg px-4 py-3 w-28">
                  <div className="mb-1">{productTypeIcons[item.slug] || productTypeIcons.default}</div>
                  <div className="text-base font-bold text-gray-700">{item.on_rent || 0}/{item.stats || 0}</div>
                  <div className="text-xs text-gray-500 text-center">{item.categoryName || '-'}</div>
                </div>
              ))}
            </div>
          }
      </div>
    </div>
  );
}
