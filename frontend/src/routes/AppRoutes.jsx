import { Route, Routes } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ContainerDetail from "../pages/container/ContainerDetail";
import ContainerList from "../pages/container/ContainerList";
import Dashboard from "../pages/dashboard/Dashboard";
import DocumentsPage from "../pages/documents/DocumentsPage";
import InvoiceMaker from "../pages/documents/InvoiceMaker";
import QuotationMaker from "../pages/documents/QuotationMaker";
import ActivityLogs from "../pages/activitylogs/ActivityLogs";
import ExporterList from "../pages/masters/ExporterList";
import HsnList from "../pages/masters/HsnList";
import ExporterAddresses from "../pages/masters/ExporterAddresses";
import ImporterList from "../pages/masters/ImporterList";
import ImporterAddresses from "../pages/masters/ImporterAddresses";
import IndiaPorts from "../pages/masters/IndiaPorts";
import ChinaPorts from "../pages/masters/ChinaPorts";
import InvoiceTemplates from "../pages/masters/InvoiceTemplates";
import ProductList from "../pages/masters/ProductList";
import ProductRates from "../pages/masters/ProductRates";
import PaymentsPage from "../pages/payments/PaymentsPage";
import ReportsPage from "../pages/reports/ReportsPage";
import UsersPage from "../pages/users/UsersPage";
import AnalyticsPage from "../pages/analytics/AnalyticsPage";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route element={<PrivateRoute />}>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="containers" element={<ContainerList />} />
        <Route path="containers/:id" element={<ContainerDetail />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="documents/invoice-maker" element={<InvoiceMaker />} />
        <Route path="documents/quotation-maker" element={<QuotationMaker />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="masters/importers" element={<ImporterList />} />
        <Route path="masters/importer-addresses" element={<ImporterAddresses />} />
        <Route path="masters/exporters" element={<ExporterList />} />
        <Route path="masters/exporter-addresses" element={<ExporterAddresses />} />
        <Route path="masters/india-ports" element={<IndiaPorts />} />
        <Route path="masters/china-ports" element={<ChinaPorts />} />
        <Route path="masters/hsn" element={<HsnList />} />
        <Route path="masters/products" element={<ProductList />} />
        <Route path="masters/product-rates" element={<ProductRates />} />
        <Route path="masters/invoice-templates" element={<InvoiceTemplates />} />
        <Route element={<RoleRoute roles={["masterAdmin", "admin"]} />}>
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Route>
    </Route>
  </Routes>
);

export default AppRoutes;
