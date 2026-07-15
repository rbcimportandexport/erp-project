import Badge from "./Badge";

const map = {
  pending: "yellow",
  intransit: "blue",
  arrived: "blue",
  cleared: "green",
  done: "green",
  
  // Custom statuses
  bl: "slate",
  boe: "green",
  cbl: "slate",
  "cfs payment": "slate",
  "cha photo file": "slate",
  checklist: "slate",
  cpl: "slate",
  duty: "slate",
  "e-way bill": "slate",
  ecpl: "slate",
  fecpl: "slate",
  "line payment": "slate",
  md: "slate",
  "p&i": "slate",
  "hold at cha": "yellow",
  "hold at party": "yellow",
  "hold at sir": "yellow",
  "hold at me": "yellow",
  "hold at anshu": "yellow",
  "work not started": "red",
  "awating for checklist": "slate",
  "checklist approved": "green",
};

const StatusBadge = ({ status }) => {
  const normStatus = (status || "").trim().toLowerCase();
  const tone = map[normStatus] || "slate";
  return <Badge tone={tone}>{status || "unknown"}</Badge>;
};

export default StatusBadge;
