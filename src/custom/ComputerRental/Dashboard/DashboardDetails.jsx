import InventoryOverview from "./InventoryOverview";
import RevenueFinancials from "./RevenueFinancials";
import SummaryRow from "./SummaryRow";
import ContractEnding from "./ContractEnding";
import ReplacementPending from "./ReplacementPending";

import { ProductLastActivity } from "../customer_report/ProductLastActivity";

function DashboardDetails() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-0 p-3">
            <ProductLastActivity text={'Product Last Activity'} color={"bg-blue-700"} />
        </div>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-0 p-3">
        <SummaryRow />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-0 p-3">
        <InventoryOverview />
        <RevenueFinancials />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-0 p-3">
        <ReplacementPending />
        <ContractEnding />
      </div>
      
    </>
  );
}

export default DashboardDetails;