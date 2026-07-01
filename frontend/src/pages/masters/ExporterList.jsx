import exporterApi from "../../api/exporterApi";
import ResourcePage from "../ResourcePage";

const ExporterList = () => <ResourcePage title="Exporters" api={exporterApi} fields={[
  { name: "name", label: "Name", required: true },
]} columns={[{ header: "ID", accessorKey: "_id" }, { header: "Name", accessorKey: "name" }]} />;

export default ExporterList;
