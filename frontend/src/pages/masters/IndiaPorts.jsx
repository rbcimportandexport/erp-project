import { indiaPortApi } from "../../api/portApi";
import ResourcePage from "../ResourcePage";
import { EditCellButton, MasterHeader, masterRowClass } from "./masterPageUi";

const IndiaPorts = () => (
  <ResourcePage
    title="India Ports"
    api={indiaPortApi}
    tableVariant="cards"
    getRowClassName={masterRowClass}
    renderHeader={(props) => (
      <MasterHeader {...props} addLabel="Add India Port" searchPlaceholder="Search india port" />
    )}
    fields={[
      { name: "portName", label: "Port Name", required: true },
      { name: "state", label: "State" },
    ]}
    columns={[
      {
        header: "Port",
        accessorKey: "portName",
        cell: ({ row, table }) => <EditCellButton row={row} table={table}>{row.original.portName || row.original.port_name}</EditCellButton>,
      },
      { header: "State", accessorKey: "state", cell: ({ row }) => row.original.state || "-" },
    ]}
  />
);

export default IndiaPorts;
