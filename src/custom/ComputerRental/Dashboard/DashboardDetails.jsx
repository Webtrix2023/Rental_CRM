import InventoryOverview from "./InventoryOverview";
import RevenueFinancials from "./RevenueFinancials";
import CustomerInsights from "./CustomerInsights";
// import QuickActions from "./QuickActions";
import AnalyticsTrends from "./AnalyticsTrends";

// Sample data to show structure
const statusCounts = { in_stock: 50, on_rent: 100, under_repair: 5, reserved: 20 };
const mostProfitableProducts = [
  { name: "Dell Latitude", revenue: 40000 },
  { name: "MacBook Air", revenue: 25000 },
];
const topCustomers = [
  { name: "ABC Corp", totalPaid: 65000 },
  { name: "XYZ Pvt Ltd", totalPaid: 32000 },
];
const newCustomers = [
  { name: "PQR Solutions" },
  { name: "Newwave Tech" },
];
const rentalTrends = [
  { month: "Jan", count: 40 }, { month: "Feb", count: 38 }, { month: "Mar", count: 50 }
];
const inventoryAging = [
  { name: "HP EliteBook", days: 60 }, { name: "Logitech Mouse", days: 40 }
];
const rentalDurations = [
  { duration: "1 Month", count: 70 }, { duration: "3 Months", count: 40 }
];

// Main dashboard
function DashboardDetails() {
  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 p-3">
      <InventoryOverview
        totalAssets={124 + 76 + 200}
        statusCounts={statusCounts}
        utilizationRate={78}
      />
      <RevenueFinancials
        revenueThisMonth={123000}
        outstandingPayments={15000}
        mostProfitableProducts={mostProfitableProducts}
      />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-0 p-3">
      {/* <CustomerInsights
        topCustomers={topCustomers}
        newCustomers={newCustomers}
      />
      <AnalyticsTrends
        rentalTrends={rentalTrends}
        inventoryAging={inventoryAging}
        rentalDurations={rentalDurations}
      /> */}
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