const toneMap = {
  slate:  "badge badge-slate",
  yellow: "badge badge-amber",
  blue:   "badge badge-blue",
  green:  "badge badge-green",
  red:    "badge badge-red",
  indigo: "badge badge-indigo",
};

const Badge = ({ children, tone = "slate" }) => (
  <span className={toneMap[tone] ?? "badge badge-slate"}>
    {children}
  </span>
);

export default Badge;
