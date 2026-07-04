import hsnApi from "../../api/hsnApi";
import ResourcePage from "../ResourcePage";
import { EditCellButton, MasterHeader, masterRowClass } from "./masterPageUi";

const HsnList = () => (
  <ResourcePage
    title="HSN Codes"
    api={hsnApi}
    tableVariant="cards"
    getRowClassName={masterRowClass}
    renderHeader={(props) => (
      <MasterHeader {...props} addLabel="Add HSN Code" searchPlaceholder="Search HSN code" />
    )}
    fields={[
      { name: "code", label: "Code", required: true },
      { name: "description", label: "Description", required: true },
      { name: "dutyRate", label: "Duty Rate", type: "number" },
      { name: "gstRate", label: "GST Rate", type: "number" },
    ]}
    columns={[
      {
        header: "Code",
        accessorKey: "code",
        cell: ({ row, table }) => <EditCellButton row={row} table={table}>{row.original.code}</EditCellButton>,
      },
      { header: "Description", accessorKey: "description", cell: ({ row }) => row.original.description || "-" },
      { header: "Duty", accessorKey: "dutyRate", cell: ({ row }) => row.original.dutyRate ?? row.original.duty_rate ?? "-" },
      { header: "GST", accessorKey: "gstRate", cell: ({ row }) => row.original.gstRate ?? row.original.gst_rate ?? "-" },
    ]}
  />
);

export default HsnList;
