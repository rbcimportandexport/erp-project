import exporterApi from "../../api/exporterApi";
import ResourcePage from "../ResourcePage";
import { EditCellButton, MasterHeader, masterRowClass } from "./masterPageUi";

const ExporterList = () => (
  <ResourcePage
    title="Exporters"
    api={exporterApi}
    tableVariant="cards"
    getRowClassName={masterRowClass}
    renderHeader={(props) => (
      <MasterHeader {...props} addLabel="Add Exporter" searchPlaceholder="Search exporter name" />
    )}
    fields={[
      { name: "name", label: "Name", required: true },
    ]}
    columns={[
      {
        header: "Exporter",
        accessorKey: "name",
        cell: ({ row, table }) => <EditCellButton row={row} table={table}>{row.original.name}</EditCellButton>,
      },
      {
        header: "Record ID",
        accessorKey: "_id",
        cell: ({ row }) => (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {(row.original._id || "").slice(0, 8)}...
          </span>
        ),
      },
    ]}
  />
);

export default ExporterList;
