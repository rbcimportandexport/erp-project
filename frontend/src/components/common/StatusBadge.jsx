import Badge from "./Badge";

const map = {
  pending: "yellow",
  inTransit: "blue",
  arrived: "blue",
  cleared: "green",
  done: "slate",
};

const StatusBadge = ({ status }) => <Badge tone={map[status] || "slate"}>{status || "unknown"}</Badge>;

export default StatusBadge;
