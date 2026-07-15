import { invoiceTemplateApi } from "../../api/productApi";
import ResourcePage from "../ResourcePage";
import { EditCellButton, MasterHeader, masterRowClass } from "./masterPageUi";

const InvoiceTemplates = () => (
  <ResourcePage
    title="Invoice Templates"
    api={invoiceTemplateApi}
    tableVariant="cards"
    getRowClassName={masterRowClass}
    renderHeader={(props) => (
      <MasterHeader {...props} addLabel="Add Template" searchPlaceholder="Search template name" />
    )}
    fields={[
      { name: "name", label: "Name", required: true },
      { name: "importer", label: "Importer ID" },
      { name: "exporter", label: "Exporter ID" },
      { name: "templateContent", label: "Template Content", required: true },
    ]}
    columns={[
      {
        header: "Template",
        accessorKey: "name",
        cell: ({ row, table }) => <EditCellButton row={row} table={table}>{row.original.name}</EditCellButton>,
      },
      { header: "Default", accessorKey: "isDefault", cell: ({ row }) => (row.original.isDefault || row.original.is_default ? "Yes" : "No") },
    ]}
  />
);

export default InvoiceTemplates;
