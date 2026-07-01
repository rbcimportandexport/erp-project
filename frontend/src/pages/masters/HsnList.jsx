import hsnApi from "../../api/hsnApi";
import ResourcePage from "../ResourcePage";

const HsnList = () => <ResourcePage title="HSN Codes" api={hsnApi} fields={[
  { name: "code", label: "Code", required: true },
  { name: "description", label: "Description", required: true },
  { name: "dutyRate", label: "Duty Rate", type: "number" },
  { name: "gstRate", label: "GST Rate", type: "number" },
]} columns={[{ header: "Code", accessorKey: "code" }, { header: "Description", accessorKey: "description" }, { header: "Duty", accessorKey: "dutyRate" }, { header: "GST", accessorKey: "gstRate" }]} />;

export default HsnList;
