import { chinaPortApi } from "../../api/portApi";
import ResourcePage from "../ResourcePage";
import { EditCellButton, MasterHeader, masterRowClass } from "./masterPageUi";

const ChinaPorts = () => (
  <ResourcePage
    title="China Ports"
    api={chinaPortApi}
    tableVariant="cards"
    getRowClassName={masterRowClass}
    renderHeader={(props) => (
      <MasterHeader {...props} addLabel="Add China Port" searchPlaceholder="Search china port" />
    )}
    fields={[
      { name: "portName", label: "Port Name", required: true },
      { name: "city", label: "City" },
    ]}
    columns={[
      {
        header: "Port",
        accessorKey: "portName",
        cell: ({ row, table }) => <EditCellButton row={row} table={table}>{row.original.portName || row.original.port_name}</EditCellButton>,
      },
      { header: "City", accessorKey: "city", cell: ({ row }) => row.original.city || "-" },
    ]}
  />
);

export default ChinaPorts;
