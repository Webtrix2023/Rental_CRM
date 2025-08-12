import { lazy } from 'react';
const DeliveryChallan = lazy(() => import('@custom/ComputerRental/Delivery/DeliveryChallan'));
const CustomerReport = lazy(() => import('@custom/ComputerRental/customer_report/CustomerReport'));
const ProductReport = lazy(() => import('@custom/ComputerRental/customer_report/ProductReport'));
const DeliveryChallanList = lazy(() => import('@custom/ComputerRental/Delivery/DeliveryChallanList'));
const ProductInvocing = lazy(() => import('@custom/ComputerRental/Invoice/ProductInvocing'));
const DashboardDetails = lazy(() => import('@custom/ComputerRental/Dashboard/DashboardDetails'));
const PendingBillingReport = lazy(() => import('@custom/ComputerRental/customer_report/PendingBillingReport'));
const ChargersListView = lazy(() => import('@custom/ComputerRental/chargers/views/ChargersListView'));
const ProductsView = lazy(() => import('@custom/ComputerRental/products/views/ProductsView'));
const CustomerListView = lazy(() => import('@custom/ComputerRental/customer/views/CustomerListView'));
// ONLY protected, core system routes go here
const computerRentalRoutes = [
  {
    path: '/delivery/create',
    element: <DeliveryChallan />
  },
  {
    path: '/delivery/edit/:record_id',
    element: <DeliveryChallan />
  },
  {
    path: '/deliveries',
    element: <DeliveryChallanList />
  },
  {
    path: '/CustomerReport',
    element: <CustomerReport />
  },
  {
    path: '/customer-report/:record_id',
    element: <CustomerReport />
  },
  {
    path: '/product-report',
    element: <ProductReport />
  },
   {
    path: '/product-report/:record_id',
    element: <ProductReport />
  },
  
  {
    path: '/invoice-calculator',
    element: <ProductInvocing />
  },
  {
    path: '/dashboard',
    element: <DashboardDetails />
  },
  {
    path: '/pending-billing',
    element: <PendingBillingReport />
  },
  {
    path: '/chargeserialnumber',
    element: <ChargersListView />
  },
   {
    path: '/products',
    element: <ProductsView />
  },
  {
    path: '/products/:product_id',
    element: <ProductsView />
  },
  {
    path: '/customer',
    element: <CustomerListView />
  },
];
export default computerRentalRoutes;