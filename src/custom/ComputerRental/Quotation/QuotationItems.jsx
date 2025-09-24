import React from "react";
import QuotationItemRow from "./QuotationItemRow";

export default function QuotationItems({ items, setItems }) {
  // Row handlers as before...
 const updateRow = (idx, rowData) => {
    console.log(rowData);
    setItems(prevItems =>
      prevItems.map((item, i) => (i === idx ? { ...item, ...rowData } : item))
    );
  }
  // const removeRow = (idx) =>
  // setItems(prevItems => prevItems.length > 1
  //   ? prevItems.filter((_, i) => i !== idx)
  //   : prevItems
  // );
  const removeRow = (idx) =>
  setItems(prevItems => {
    // If only one row, don't remove
    if (prevItems.length <= 1) return prevItems;
    // Remove and recalculate srno
    return prevItems
      .filter((_, i) => i !== idx)
      .map((item, index) => ({
        ...item,
        srNo: index + 1,
      }));
  });

  const allSelectedProductIds = items.map(row => row.productObject?.product_id).filter(Boolean);
  return (
    <div className="w-full">
      <div className="grid grid-cols-7 bg-[#f6f8fc] rounded-t-lg px-4 py-3 text-sm font-semibold text-gray-500">
        <div className="col-span-3">Product</div>
        <div className="col-span-1 text-center">Qty</div>
        <div className="col-span-1 text-center">Rate</div>
        <div className="col-span-1 text-center">Total</div>
        <div className="col-span-1 text-right">Action</div>
        <div></div>
      </div>
      {items.map((item, idx) => (
        <QuotationItemRow
          key={idx}
          index={idx}
          data={item}
          updateRow={updateRow}
          removeRow={removeRow}
          disabledProductIds={allSelectedProductIds.filter(id => id && id !== item.productObject?.product_id)}
        />
      ))}
    </div>
  );
}
