import { useEffect, useState } from "react";
import InventoryPieChart from "./charts/InventoryPieChart";
import { API_BASE_URL } from "../../../config";
import { fetchJson } from "@utils/fetchJson";

export default function InventoryOverview() {
  const deDataModel = {
    utilization_rate : 0,
    on_rent_count : 0,
    available_count : 0,
    reserved_count : 0,
    total_count : 0,
    under_repaired_count:0
  };

  const [dataModel,setDataModel] = useState(deDataModel);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    async function fetchData() {
      const res = await fetchJson(`${API_BASE_URL}/inventoryOverview`, {
        method: 'POST',
        body: JSON.stringify({})
      }
      );
      const data = res.data;
      setLoading(false);

      if (res.flag === "S") {
        setDataModel(data);
      }
    }
    fetchData();
  }, []);

  return (
    <>

    <div className="bg-white border rounded-xl shadow p-4 w-full">
      {loading &&
        <div className="flex justify-center items-center min-h-[200px]">
          <h1 className="text-center animate-pulse text-gray-500 text-lg">Loading...</h1>
        </div> 
      }
      {!loading && 
        <>
        <div className="mb-2">
          <span className="text-2xl font-semibold text-gray-700">Inventory Overview</span>
        </div>
        <div className="flex justify-between items-center my-4">
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-bold text-gray-800">{dataModel.total_count || 0 }</span>
            <span className="text-md text-blue-600 font-medium">Total Assets</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-bold text-green-600">{dataModel.available_count || 0}</span>
            <span className="text-md text-gray-600 font-medium">Available</span>
          </div>
          <div className="flex flex-col items-center flex-1">
            <span className="text-2xl font-bold text-orange-500">{dataModel.on_rent_count || 0}</span>
            <span className="text-md text-gray-600 font-medium">On Rent</span>
          </div>
        </div>

        <div className="mt-4 mb-2 text-sm font-medium text-gray-700">Utilization Rate</div>
        <div className="w-full mb-1">
          <div className="relative h-2 w-full rounded-full bg-gray-200">
            <div
              className="absolute h-2 rounded-full bg-orange-500 transition-all"
              style={{ width: `${dataModel.utilization_rate || 0}%`, minWidth: '24px' }}
            />
          </div>
          <div className="flex text-sm justify-end mt-1 text-gray-700 text-base">
            {dataModel.utilization_rate || 0}%
          </div>
        </div>
        
        {/* Donut Chart Placeholder — plug in a real chart here */}
        <div className="flex justify-center items-center mt-6 mb-1">
          <InventoryPieChart
              available={dataModel.total_count || 0 }
              onRent={dataModel.on_rent_count || 0}
              underRepair={dataModel.under_repaired_count || 0}
              reserved={dataModel.reserved_count || 0}
              />
        </div>
        </>
        }
    </div>
    </>

  );
}
