import InventoryOverview from "./InventoryOverview";
import RevenueFinancials from "./RevenueFinancials";
import SummaryRow from "./SummaryRow";
import ContractEnding from "./ContractEnding";
import ReplacementPending from "./ReplacementPending";

// Sample data to show structure
const statusCounts = { in_stock: 50, on_rent: 100, under_repair: 5, reserved: 20 };
const mostProfitableProducts = [
  { name: "Dell Latitude", revenue: 40000 },
  { name: "MacBook Air", revenue: 25000 },
];

// Main dashboard
function DashboardDetails() {
  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-0 p-3">
      <SummaryRow/>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-0 p-3">
      <ReplacementPending />
      <ContractEnding />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-0 p-3">
      <InventoryOverview />
      <RevenueFinancials />
    </div>
      
    </>
  );
}

export default DashboardDetails;
/* <QuickActions
        onCreateRental={() => {}}
        onAddInventory={() => {}}
        onIssueInvoice={() => {}}
        onSchedulePickup={() => {}}
      />
      */