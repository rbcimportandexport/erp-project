import { chinaPortApi } from "../../api/portApi";
import ResourcePage from "../ResourcePage";

const ChinaPorts = () => <ResourcePage title="China Ports" api={chinaPortApi} fields={[
  { name: "portName", label: "Port Name", required: true },
  { name: "city", label: "City" },
]} columns={[{ header: "Port", accessorKey: "portName" }, { header: "City", accessorKey: "city" }]} />;

export default ChinaPorts;
