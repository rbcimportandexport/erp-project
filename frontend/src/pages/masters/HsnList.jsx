import hsnApi from "../../api/hsnApi";
import ResourcePage from "../ResourcePage";
import { EditCellButton, MasterHeader, masterRowClass } from "./masterPageUi";

const HsnList = () => (
  <ResourcePage
    title="HSN Codes"
    api={hsnApi}
    initialCustomFilters={{ source: "ICEGATE" }}
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
      {
        name: "source",
        label: "HSN List",
        type: "select",
        required: true,
        options: [
          { value: "ICEGATE", label: "Universal HSN" },
          { value: "MAIN_EXCEL", label: "Main Excel HSN" },
        ],
      },
    ]}
    columns={[
      {
        header: "Code",
        accessorKey: "code",
        cell: ({ row, table }) => <EditCellButton row={row} table={table}>{row.original.code}</EditCellButton>,
      },
      {
        header: "Description",
        accessorKey: "description",
        cell: ({ row }) => (
          <div className="w-full min-w-0 max-w-[720px] whitespace-normal break-words leading-6 tracking-normal text-slate-700 md:min-w-[360px]">
            {row.original.description || "-"}
          </div>
        ),
      },
      { header: "Duty", accessorKey: "dutyRate", cell: ({ row }) => row.original.dutyRate ?? row.original.duty_rate ?? "-" },
      { header: "GST", accessorKey: "gstRate", cell: ({ row }) => row.original.gstRate ?? row.original.gst_rate ?? "-" },
    ]}
  />
);

export default HsnList;
