import { invoiceTemplateApi } from "../../api/productApi";
import ResourcePage from "../ResourcePage";

const InvoiceTemplates = () => <ResourcePage title="Invoice Templates" api={invoiceTemplateApi} fields={[
  { name: "name", label: "Name", required: true },
  { name: "importer", label: "Importer ID" },
  { name: "exporter", label: "Exporter ID" },
  { name: "templateContent", label: "Template Content", required: true },
]} columns={[{ header: "Name", accessorKey: "name" }, { header: "Default", accessorKey: "isDefault" }]} />;

export default InvoiceTemplates;
