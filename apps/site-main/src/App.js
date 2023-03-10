import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './components/dashboard-layout';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import NotFound from './pages/404';
import DeliveryFleetManagement from './pages/assetManagement/deliveryFleetManagement';
import MachineManagement from './pages/assetManagement/machineManagement';
import ProductionLineManagement from './pages/assetManagement/productionLineManagement';
import BusinessRelations from './pages/businessRelations';
import Dashboard from './pages/dashboard';
import B2BInvoice from './pages/finance/b2b-invoice';
import Finance from './pages/finance/finance';
import MaxximizePayments from './pages/finance/maxximize-payments';
import ProfitInsight from './pages/finance/profit-insight';
import ForgotPassword from './pages/forgotPassword';
import BulkDiscount from './pages/fulfilment/bulk-discount';
import DeliveryRequest from './pages/fulfilment/delivery-request';
import ReceivedPurchaseOrder from './pages/fulfilment/received-purchase-order';
import ReceivedSalesInquiry from './pages/fulfilment/received-sales-inquiry';
import SentQuotation from './pages/fulfilment/sent-quotation';
import Bin from './pages/inventory/bin';
import BinDetails from './pages/inventory/bin-details';
import Masterlist from './pages/inventory/masterlist';
import MasterlistLineItems from './pages/inventory/masterlist-line-items';
import Rack from './pages/inventory/rack';
import Warehouse from './pages/inventory/warehouse';
import Login from './pages/login';
import MembershipRoute from './pages/membership-route';
import OrganisationSelection from './pages/organisationSelection';
import { PricingPage } from './pages/pricing';
import ProcurementForecast from './pages/procurement/forecast';
import ProcurementGoodsReceipt from './pages/procurement/goods-receipt';
import PurchaseOrder from './pages/procurement/purchase-order';
import PurchaseRequisition from './pages/procurement/purchase-requisition';
import Quotation from './pages/procurement/quotation';
import SalesInquiry from './pages/procurement/sales-inquiry';
import BillOfMaterial from './pages/production/bom';
import ProductionOrder from './pages/production/production-order';
import ProductionRequest from './pages/production/production-request';
import Products from './pages/products';
import ProfilePage from './pages/profile';
import ProtectedPublicRoute from './pages/protectedPublicRoute';
import ProtectedRoute from './pages/protectedRoute';
import QATracking from './pages/qa-tracking';
import QAChecklists from './pages/qaChecklists';
import QARules from './pages/qaRules';
import { RegisterOrganisation } from './pages/registerOrganisation';
import ResetPassword from './pages/resetpassword';
import SubscriptionProRoute from './pages/subscription-pro-route';
import Unauthorized from './pages/unauthorized';
import WorkerManagement from './pages/workermanagement';

const ROLES = {
  Admin: 'admin',
  Manager: 'manager',
  FactoryWorker: 'factoryworker',
  SuperAdmin: 'superadmin',
  Driver: 'driver'
};

const routes = (
  <Routes>
    <Route path="/" element={<Layout />}>
      {/* Public Routes */}
      <Route path="/organisationselection" element={<ProtectedPublicRoute />}>
        <Route
          path="/organisationselection"
          element={<OrganisationSelection />}
        ></Route>
      </Route>
      <Route path="/register-organisation" element={<ProtectedPublicRoute />}>
        <Route
          path="/register-organisation"
          element={<RegisterOrganisation />}
        ></Route>
      </Route>
      <Route path="/login/:orgId" element={<ProtectedPublicRoute />}>
        <Route path="/login/:orgId" element={<Login />}></Route>
      </Route>
      <Route path="/forgotpassword/:orgId" element={<ProtectedPublicRoute />}>
        <Route
          path="/forgotpassword/:orgId"
          element={<ForgotPassword />}
        ></Route>
      </Route>
      <Route path="unauthorized" element={<Unauthorized />}></Route>

      {/* Protected Routes */}

      {/* Protected Routes for all Roles */}
      <Route
        element={
          <RequireAuth
            requiredRoles={[
              ROLES.Admin,
              ROLES.Manager,
              ROLES.FactoryWorker,
              ROLES.SuperAdmin,
              ROLES.Driver
            ]}
          />
        }
      >
        {/*First time login, without dashboard layout*/}
        <Route path="/resetpassword" element={<ProtectedRoute />}>
          <Route path="/resetpassword" element={<ResetPassword />} />
        </Route>

        <Route path="/pricing" element={<PricingPage />} />

        {/* Check if User Org has membership */}
        <Route element={<MembershipRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Placeholder Dashboard */}
            <Route path="/" element={<Dashboard />}></Route>

            {/* Routes for Manager and Admin */}
            <Route
              element={
                <RequireAuth
                  requiredRoles={[ROLES.Admin, ROLES.Manager, ROLES.SuperAdmin]}
                />
              }
            >
              {/* Profile Page */}
              <Route path="/profile" element={<ProfilePage />} />
              {/* Business Relations */}
              <Route
                path="businessrelations"
                element={<BusinessRelations />}
              ></Route>
              {/* Finance Management */}
              {/* Revenue-Costs */}
              <Route path="finance/revenue-cost" element={<Finance />}></Route>
              {/* B2B Invoices */}
              <Route
                path="finance/profit-insight"
                element={<ProfitInsight />}
              ></Route>
              {/* B2B Invoices */}
              <Route
                path="finance/b2b-invoice"
                element={<B2BInvoice />}
              ></Route>
              {/* Maxximize Payments */}
              <Route
                path="finance/maxximize-payments"
                element={<MaxximizePayments />}
              ></Route>
            </Route>

            {/* Product Management */}
            {/* Protected Routes for Admin Specifically */}
            <Route
              element={
                <RequireAuth requiredRoles={[ROLES.Admin, ROLES.SuperAdmin]} />
              }
            >
              {/* Worker Management */}
              <Route
                path="workermanagement"
                element={<WorkerManagement />}
              ></Route>
            </Route>

            {/* Protected Routes for Manager*/}
            <Route
              element={
                <RequireAuth
                  requiredRoles={[ROLES.Manager, ROLES.SuperAdmin]}
                />
              }
            >
              {/* Product Management */}
              <Route
                path="products/raw-materials"
                element={<Products type="raw-materials" key={1} />}
              ></Route>
              <Route
                path="products/final-goods"
                element={<Products type="final-goods" key={2} />}
              ></Route>

              {/* Procurement Forecast */}
              <Route element={<SubscriptionProRoute />}>
                <Route
                  path="procurement/forecast"
                  element={<ProcurementForecast />}
                ></Route>
              </Route>
              {/* Quality Assurance */}
              <Route
                path="quality-assurance/rules"
                element={<QARules />}
              ></Route>
              <Route
                path="quality-assurance/checklists"
                element={<QAChecklists />}
              ></Route>
              <Route element={<SubscriptionProRoute />}>
                <Route
                  path="quality-assurance/tracking"
                  element={<QATracking />}
                ></Route>
              </Route>
            </Route>

            {/* Protected Routes for Manager and Factory Worker */}
            <Route
              element={
                <RequireAuth
                  requiredRoles={[
                    ROLES.Manager,
                    ROLES.FactoryWorker,
                    ROLES.SuperAdmin,
                  ]}
                />
              }
            >
              {/* Procurement */}
              {/* Procurement Modules */}
              <Route
                path="procurement/purchase-requisition"
                element={<PurchaseRequisition />}
              ></Route>
              <Route
                path="procurement/sales-inquiry"
                element={<SalesInquiry />}
              ></Route>
              <Route
                path="procurement/quotation"
                element={<Quotation />}
              ></Route>
              <Route
                path="procurement/purchase-order"
                element={<PurchaseOrder />}
              ></Route>
              <Route
                path="procurement/goods-receipt"
                element={<ProcurementGoodsReceipt />}
              ></Route>

              {/* Asset Management */}
              {/* TBD */}
              {/* Production */}
              {/* Production Modules */}
              <Route
                path="production/bill-of-material"
                element={<BillOfMaterial />}
              ></Route>
              <Route
                path="production/machine"
                element={<MachineManagement />}
              ></Route>
              <Route
                path="production/production-line"
                element={<ProductionLineManagement />}
              ></Route>
              <Route
                path="production/production-request"
                element={<ProductionRequest />}
              ></Route>
              <Route
                path="production/production-order"
                element={<ProductionOrder />}
              ></Route>
              <Route
                path="production/delivery-fleet-management"
                element={<DeliveryFleetManagement />}
              ></Route>

              {/* Production */}
              {/* Production Modules */}
              <Route
                path="production/bill-of-material"
                element={<BillOfMaterial />}
              ></Route>
              <Route
                path="production/machine"
                element={<MachineManagement />}
              ></Route>
              <Route
                path="production/production-line"
                element={<ProductionLineManagement />}
              ></Route>
              <Route
                path="production/production-request"
                element={<ProductionRequest />}
              ></Route>
              <Route
                path="production/production-order"
                element={<ProductionOrder />}
              ></Route>

              {/* Delivery Fleet */}
              {/* Delivery Fleet Module */}
              <Route
                path="deliveryFleetManagement"
                element={<DeliveryFleetManagement />}
              ></Route>

              {/* Inventory */}
              {/* Inventory Modules */}
              <Route path="inventory/warehouse" element={<Warehouse />}></Route>
              <Route path="inventory/warehouse/rack" element={<Rack />}></Route>
              <Route
                path="inventory/warehouse/rack/bin"
                element={<Bin />}
              ></Route>
              <Route
                path="inventory/warehouse/rack/bin/details"
                element={<BinDetails />}
              ></Route>
              <Route element={<SubscriptionProRoute />}>
                <Route
                  path="inventory/masterlist"
                  element={<Masterlist />}
                ></Route>
              </Route>
              <Route
                path="inventory/masterlist/lineItems"
                element={<MasterlistLineItems />}
              ></Route>

              {/* Fulfilment */}
              {/* Fulfilment Modules */}
              <Route
                path="fulfilment/bulk-discount"
                element={<BulkDiscount />}
              ></Route>
              <Route
                path="fulfilment/received-sales-inquiry"
                element={<ReceivedSalesInquiry />}
              ></Route>
              <Route
                path="fulfilment/sent-quotation"
                element={<SentQuotation />}
              ></Route>
              <Route
                path="fulfilment/received-purchase-order"
                element={<ReceivedPurchaseOrder />}
              ></Route>
              <Route
                path="fulfilment/delivery-request"
                element={<DeliveryRequest />}
              ></Route>
              {/* Fulfilment */}
              {/* Fulfilment Modules */}
              <Route
                path="fulfilment/received-sales-inquiry"
                element={<ReceivedSalesInquiry />}
              ></Route>
              <Route
                path="fulfilment/sent-quotation"
                element={<SentQuotation />}
              ></Route>
              <Route
                path="fulfilment/received-purchase-order"
                element={<ReceivedPurchaseOrder />}
              ></Route>
              <Route
                path="fulfilment/delivery-request"
                element={<DeliveryRequest />}
              ></Route>
            </Route>
          </Route>
        </Route>
      </Route>

      {/* catch all */}
      <Route path="*" element={<NotFound />}></Route>
    </Route>
  </Routes>
);

const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {routes}
    </LocalizationProvider>
  );
};

export default App;
