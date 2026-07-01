import { createCrudApi } from "../../api/crudApi";
import ResourcePage from "../ResourcePage";

const activityLogApi = createCrudApi("/activity-logs");

const ActivityLogs = () => <ResourcePage title="Activity Logs" api={activityLogApi} fields={[
  { name: "action", label: "Action" },
  { name: "module", label: "Module" },
  { name: "description", label: "Description" },
]} columns={[{ header: "Action", accessorKey: "action" }, { header: "Module", accessorKey: "module" }, { header: "User", accessorFn: (row) => row.user?.name || "" }, { header: "Description", accessorKey: "description" }]} />;

export default ActivityLogs;
