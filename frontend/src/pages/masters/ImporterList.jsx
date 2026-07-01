import importerApi from "../../api/importerApi";
import ResourcePage from "../ResourcePage";

const ImporterList = () => <ResourcePage title="Importers" api={importerApi} fields={[
  { name: "name", label: "Name", required: true },
]} columns={[{ header: "ID", accessorKey: "_id" }, { header: "Name", accessorKey: "name" }]} />;

export default ImporterList;
