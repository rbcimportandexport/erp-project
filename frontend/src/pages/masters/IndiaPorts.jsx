import { indiaPortApi } from "../../api/portApi";
import ResourcePage from "../ResourcePage";

const IndiaPorts = () => <ResourcePage title="India Ports" api={indiaPortApi} fields={[
  { name: "portName", label: "Port Name", required: true },
  { name: "state", label: "State" },
]} columns={[{ header: "Port", accessorKey: "portName" }, { header: "State", accessorKey: "state" }]} />;

export default IndiaPorts;
