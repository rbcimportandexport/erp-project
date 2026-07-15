import containerApi from "../../api/containerApi";
import ResourcePage from "../ResourcePage";

const ReportsPage = () => <ResourcePage title="Reports" api={containerApi} fields={[]} columns={[
  { header: "Container", accessorKey: "containerNo" },
  { header: "Importer", accessorFn: (row) => row.importer?.name || "" },
  { header: "Exporter", accessorFn: (row) => row.exporter?.name || "" },
  { header: "Status", accessorKey: "status" },
]} />;

export default ReportsPage;
