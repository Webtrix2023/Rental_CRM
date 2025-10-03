import { useState, useEffect } from 'react';
import { API_BASE_URL } from "@config";
import { fetchJson } from "@utils/fetchJson";
import { SmartSelectInput } from "@components/index";
import DatePicker from "react-datepicker";
import { format } from "date-fns";


function ContractEnding() {
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState([]);
    const [filters, setFilters] = useState({
        customer_id: "",
        contract_end_to: "",
        contract_end_from: "",
    });
    useEffect(() => {
        setLoading(true);
        async function fetchData() {
            const res = await fetchJson(`${API_BASE_URL}contract_ending_assets`, {
                method: 'POST',
                body: JSON.stringify(filters)
            });
            const data = res.data;
            setLoading(false);
            if (res.flag === "S") {
                setAssets(data);
            } else {
                setAssets([]);
            }
        }
        fetchData();
    }, [filters]);

    function formatDate(dateStr) {
        if (!dateStr) return "-";
        const d = new Date(dateStr.replace(/-/g, "/"));
        return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" });
    }

    function SkeletonRow({ count = 3 }) {
        const rows = Array.from({ length: count }, (_, i) => (
            <tr key={i} className="animate-pulse border-b border-b-gray-200">
                <td className="px-4 py-3">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </td>
                <td className="px-4 py-3">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </td>
                <td className="px-4 py-3">
                    <div className="h-4 w-28 bg-gray-200 rounded"></div>
                </td>
                <td className="px-4 py-3">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </td>
                <td className="px-4 py-3">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </td>
                <td className="px-4 py-3">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </td>
            </tr>
        ));
        return <>{rows}</>;
    }

    return (
        <div className="rounded-xl shadow border border-gray-200 bg-white px-3 pt-7 w-full flex flex-col">
            <label className="text-lg font-semibold text-gray-700 ">
                Contract Ending Assets
            </label>

            <div className=" max-w-5xl flex flex-col md:flex-row flex-wrap gap-2 md:gap-3 bg-white  px-3 md:px-0 py-3 md:py-4 items-start md:items-end mb-1">


                <div className="w-full md:w-auto">
                    <div className="text-xs text-gray-700 mb-1">Customer </div>
                    <SmartSelectInput
                        id="customer" label="" value={filters.customer_id}
                        onSelect={(data) => {
                            setFilters(f => ({ ...f, customer_id: data }))
                        }}
                        onObjectSelect={() => { }}
                        config={{
                            type: 'customer', valueKey: 'customer_id',
                            source: 'customer',
                            getLabel: (item) => `${item.name}`,
                            getValue: (item) => item.customer_id,
                            placeholder: 'Select Customer',
                            list: "name,customer_id",
                            allowAddNew: true,
                            preload: true,
                            cache: true,
                            statusCheck: true,
                            showRecent: true
                        }}
                    />
                </div>
                <div className="w-full md:w-auto">
                    <div className="text-xs mb-1">Contract End in</div>
                    <div className='flex'>

                        <div>
                            <DatePicker
                                selected={filters.contract_end_from || null}
                                onChange={(date) => {
                                    setFilters(f => ({
                                        ...f, contract_end_from: format(new Date(date), "yyyy-MM-dd")
                                    }))
                                }
                                }
                                className="ws-input form-input bg-gray-100 rounded px-3 py-2 pr-10 text-gray-600 text-sm w-full md:w-45 mr-3"
                                placeholderText="Start date"
                                dateFormat="yyyy-MM-dd"
                            />
                        </div>
                        <div>
                            <DatePicker
                                selected={filters.contract_end_to || null}
                                onChange={(date) => {
                                    setFilters(f => ({
                                        ...f, contract_end_to: format(new Date(date), "yyyy-MM-dd")
                                    }))
                                }
                                }
                                className="ws-input form-input bg-gray-100 rounded px-3 py-2 pr-10 text-gray-600 text-sm w-full md:w-45 mr-3"
                                placeholderText="End date"
                                dateFormat="yyyy-MM-dd"
                            />
                        </div>
                    </div>
                </div>

                {Object.values(filters).some(val => val !== "") &&
                    (<button
                        className="w-full md:w-auto mt-2 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold text-sm"
                        onClick={e => {
                            e.preventDefault();
                            setFilters(
                                {
                                    customer_id: "",
                                    contract_end: "",
                                });
                            // setPage(1);
                        }}
                    >
                        <span className="mr-1">❌</span>Clear
                    </button>)}
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-80">
                <table className="min-w-full border border-gray-200 text-sm overflow-y-auto">
                    <thead className="sticky top-0 bg-gray-100 text-gray-700 text-xs">
                        <tr>
                            <th className="text-xs px-4 py-3 text-left">Product</th>
                            <th className="text-xs px-4 py-3 text-left">Contract End</th>
                            <th className="text-xs px-4 py-3 text-left">Delivery No</th>
                            <th className="text-xs px-4 py-3 text-left">Customer Name</th>
                            <th className="text-xs px-4 py-3 text-left">Delivery Date</th>
                            <th className="text-xs px-4 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className=''>
                        {loading && <SkeletonRow count={5} />}

                        {!loading && assets.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center text-gray-500 py-6">
                                    No records found
                                </td>
                            </tr>
                        )}

                        {!loading && assets.map((line) => {
                            const product_details = line.product_details || {};
                            return (
                                <tr key={line.id} className="border-b border-b-gray-200 hover:bg-gray-50 transition">
                                    <td className="text-xs px-4 py-3 font-medium">
                                        <div>
                                            {product_details.product_name || "N/A"}
                                        </div>
                                        <div className='text-xs text-gray-600'>
                                            {product_details.product_serial_no || "N/A"}
                                        </div>
                                    </td>

                                    <td className="text-xs px-4 py-3 text-red-500 font-medium">
                                        {line.contract_end ? formatDate(line.contract_end) : "-"}
                                    </td>
                                    <td className="text-xs px-4 py-3">{line.invoiceNumber || "N/A"}</td>
                                    <td className="text-xs px-4 py-3">{line.customer_name || "N/A"}</td>
                                    <td className="text-xs px-4 py-3">{formatDate(line.delivery_date) || "N/A"}</td>
                                    <td className="text-xs px-4 py-3 text-right text-green-600 font-bold">
                                        ₹{line.invoiceLineRate || "0.00"}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ContractEnding;
