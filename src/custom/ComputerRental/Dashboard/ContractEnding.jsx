import { useState, useEffect } from 'react';
import { API_BASE_URL } from "@config";
import { fetchJson } from "@utils/fetchJson";

function ContarctEnding() {
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState([]);

    useEffect(() => {
        setLoading(true);
        async function fetchData() {
            const res = await fetchJson(`${API_BASE_URL}/contract_ending_assets`, {
                method: 'POST',
                body: JSON.stringify({})
            }
            );
            const data = res.data;
            setLoading(false);
            if (res.flag === "S") {
                setAssets(data);
                console.log('Assets  : ', assets);
            } else {
                setAssets([]);
            }
        }
        fetchData();
    }, []);
    function formatDate(dateStr) {
        if (!dateStr) return "-";
        const d = new Date(dateStr.replace(/-/g, "/"));
        return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "2-digit" });
    }
    function SkeletonRow({ count = 3 }) {
        const rows = Array.from({ length: count }, (_, i) => (
            <div key={i} className="flex items-center py-4 px-4 animate-pulse mb-2 border border-gray-200">
                <div className="w-6 h-6 bg-gray-200 rounded mr-4" />
                <div className="flex-1">
                    <div className="w-1/2 h-4 bg-gray-200 rounded mb-2" />
                    <div className="w-1/3 h-3 bg-gray-100 rounded" />
                </div>
                <div className="w-24 h-5 bg-gray-100 rounded ml-2" />
            </div>
        ));
        return <div className="rounded-lg">{rows}</div>;
    }

    function RowCard({ line }) {
        const product_details = line.product_details || {};

        return (
            <div className="flex items-center border bg-gray-50 border-gray-200 p-3 rounded-lg mb-2 hover:bg-white transition cursor-pointer">
                <div className="mr-4 flex-1">
                    <div className="block text-gray-600 mb-1">
                        <span className="ml-1">
                            {product_details.product_name ? (
                                <span className="font-bold">{product_details.product_name}</span>
                            ) : (
                                <span className="text-sm text-gray-400">No Product Name</span>
                            )}
                        </span>
                        <span className="ml-1">
                            {product_details.product_serial_no ? (
                                <span className="font-normal ml-1.5">{product_details.product_serial_no}</span>
                            ) : (
                                <span className="text-sm text-gray-400 ml-1.5">No Serial No.</span>
                            )}
                        </span>
                        <span className="ml-3 text-sm text-red-500">
                            Contract is ending on <span className="font-normalml-1.5">{line.contract_end ? formatDate(line.contract_end) : ' - ' }</span>
                        </span>
                    </div>
                    <div className="text- text-gray-500">
                        <p>
                            <span className='text-gray-500'> Delivery Number: {line.invoiceNumber || "N/A"} | </span>
                            <span className='text-gray-500'> Customer Name: {line.customer_name || "N/A"} </span>
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400">{formatDate(line.delivery_date) || "N/A"}</div>
                    <div className="text-green-600 font-bold">
                        ₹{line.invoiceLineRate || "0.00"}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-xl shadow border border-gray-200 bg-white px-3 pt-7 w-full flex flex-col">
            <label className="text-lg font-semibold text-gray-700 mb-4" htmlFor="">
                Contract Ending Assets
            </label>

            <div className="max-w-full">
                <div className="grid grid-cols-1 gap-3 mb-5">
                    {loading && <SkeletonRow />}

                    {!loading && assets.length === 0 && (
                        <div className="text-center text-gray-500 py-6">
                            <h2 className="text-lg">No records found</h2>
                        </div>
                    )}

                    <div className="overflow-y-auto h-[25rem] space-y-2">
                        {!loading && assets.map((line) => (
                            <RowCard key={line.id} line={line} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

}

export default ContarctEnding