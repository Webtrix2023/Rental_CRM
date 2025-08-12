import React, { useRef } from 'react';
import { API_BASE_URL } from '../../../config';

export const ReportExport = function ReportExport({ filters, customerId, customerName } ) {
  const formRef = useRef(null);

  const handleExport = (e) => {
    e.preventDefault();    
    const form = formRef.current;
    const report_type = e.currentTarget.getAttribute("data-report_type");

    if (!form) return;

    let dataInput = form.querySelector("input[name='data']");
    if (!dataInput) {
        dataInput = document.createElement("input");
        dataInput.type = "hidden";
        dataInput.name = "data";
        form.appendChild(dataInput);
    }
    const bodyJson = {
        report_type: report_type,
        customer_id: customerId,
        customerName: encodeURIComponent(customerName),
        // curpage: String(page - 1),
        action : filters.status,
        assetType : filters.assetType,
        dateFrom : filters.dateFrom,
        dateTo : filters.dateTo,
    }

    dataInput.value = JSON.stringify(bodyJson);

    form.action = `${API_BASE_URL}/exportReport`;
    form.method = "POST";
    form.target = "_blank";

    form.submit();

    setTimeout(() => {
        form.action = "#";
        form.method = "POST";
        form.target = "";
    }, 100);
  };

  return (
    <form ref={formRef} className='flex gap-2 mt-4 md:mt-0'>
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold text-sm" 
            data-report_type = "excel"
            onClick={handleExport}
        >
            ⬇️ Export Excel
        </button>
        <button  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold text-sm"
            data-report_type = "pdf"
            onClick={handleExport}
        >
            ⬇️ Export PDF
        </button>
    </form>
  );
}

// export default ReportExport;

