import React, { useState } from "react";
import { ArrowUpFromLine } from "lucide-react";

export const UpgradePopup = ({ itemRow, isOpen, onClose }) => {

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  function SkeletonRow() {
    return (
      <div className="border border-gray-400 rounded-lg">
        <div className="flex items-center py-4 px-4 animate-pulse mb-2">
          <div className="w-6 h-6 bg-gray-200 rounded mr-4" />
          <div className="flex-1">
            <div className="w-1/2 h-4 bg-gray-200 rounded mb-2" />
            <div className="w-1/3 h-3 bg-gray-100 rounded" />
          </div>
          <div className="w-24 h-5 bg-gray-100 rounded ml-2" />
        </div>
        <div className="flex items-center py-4 px-4 animate-pulse mb-2">
          <div className="w-6 h-6 bg-gray-200 rounded mr-4" />
          <div className="flex-1">
            <div className="w-1/2 h-4 bg-gray-200 rounded mb-2" />
            <div className="w-1/3 h-3 bg-gray-100 rounded" />
          </div>
          <div className="w-24 h-5 bg-gray-100 rounded ml-2" />
        </div>
        <div className="flex items-center py-4 px-4 animate-pulse mb-2">
          <div className="w-6 h-6 bg-gray-200 rounded mr-4" />
          <div className="flex-1">
            <div className="w-1/2 h-4 bg-gray-200 rounded mb-2" />
            <div className="w-1/3 h-3 bg-gray-100 rounded" />
          </div>
          <div className="w-24 h-5 bg-gray-100 rounded ml-2" />
        </div>
      </div>
    );
  }
  function capitalize(str) {
    if (!str) return '';
    str = str.replace('_',' ')
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#8f8f8fab] bg-opacity-40 px-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 relative">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>
        <div className="flex items-center mb-6">
          <div className="bg-orange-100 text-orange-600 p-2 rounded-full mr-3">
            <ArrowUpFromLine size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Upgrades </h2>
            <p className="text-sm text-gray-500">
              Product upgrades on this item by customer
            </p>
          </div>
        </div>

        {loading &&
          <SkeletonRow />}

        {!loading && (
          itemRow?.upgradeLines?.map((line) => {
            return (
              <div class="flex items-center border p-3 rounded-lg mb-2 hover:bg-gray-50 transition cursor-pointer">
                <div class="mr-4 flex-1">
                  <div class="font-medium text-gray-600 mb-1">
                    <span >{capitalize((line.upgrade_type || "")) || "[upgrade type]"}</span>
                    <span>
                      {line.old_val && line.new_val && (
                        <span class="font-normal text-sm ml-1.5"> 
                          upgraded from 
                          <span className="text-blue-400 ml-2 mr-1">{line.old_val || '-'}</span>
                           to
                          <span className="text-blue-400 ml-1 ">{line.new_val || "-"}</span>
                        </span>
                      )}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500">
                    <span class="mr-1">{line.product_serial_no || '-'}</span>
                    <span>| Charges Apply From: {capitalize(line.charges_apply_from)}</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-gray-400">{line.return_date}</div>
                  <div class="text-green-600 font-bold">
                    ₹{line.charges}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
};

export default {
  UpgradePopup,
};
