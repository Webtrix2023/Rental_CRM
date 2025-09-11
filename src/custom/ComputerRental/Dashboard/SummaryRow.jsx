import React from 'react'
import { useState, useEffect } from 'react';
import { TrendingUp, Clock, PieChart} from "lucide-react";
import { API_BASE_URL } from "@config";
import { fetchJson } from "@utils/fetchJson";

function SummaryRow() {
    const defSummary = {
        "pending_amount" : 0 ,
        "revenue_last_month" : 0,
        "total_assets" : 0
    };
    const [summary, setSummary] = useState(defSummary);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        setLoading(true);
        async function fetchData() {
            const res = await fetchJson(`${API_BASE_URL}/dashboard/summary`, {
                method: 'POST',
                body: JSON.stringify({})
            }
            );
            const data = res.data;
            setLoading(false);
            if (res.flag === "S") {
                console.log('summary : ',summary);
                setSummary(data)
            }
        }
        fetchData();
    }, []);    
    
    function RowCard({icon, valueToShow, label  }) {
        return (
            <div className="flex justify-between items-center border border-gray-200  bg-white rounded-xl shadow-sm px-5 py-4 min-w-[160px]">
                <div>
                    <div className="text-xs md:text-sm text-gray-500 font-medium">{label ||''}</div>
                    {!loading && (<div className={`text-2xl font-bold text-gray-800`}>{valueToShow || 0}</div>)}
                    {loading && (<div className={`text-2xl font-bold text-gray-800 animate-bounce`}>-</div>)}
                </div>
                <div> {icon || ""}</div>
            </div>
        )
    }

  return (
    <div className=" rounded-xl px-3 pt-7 w-full flex flex-col" >
        <div className="max-w-full">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                <RowCard icon={(<PieChart className="text-blue-500 text-3xl" />)} label={"Total Assets"} valueToShow={summary.total_assets} />
                <RowCard icon={(<TrendingUp className="text-orange-500 text-3xl" />)} label={"Revenue Last Month"} valueToShow={summary.revenue_last_month} />
                <RowCard icon={(<Clock className="text-blue-500 text-3xl" />)} label={"Pending Amount"} valueToShow={summary.pending_amount} />
            </div>
        </div>
    </div>
  )
}

export default SummaryRow