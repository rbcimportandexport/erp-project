import { useState } from "react";
import dayjs from "dayjs";
import {
  AlertTriangle, Boxes, CalendarDays, CheckCircle2, Clock,
  FileWarning, IndianRupee, ListTodo, Activity, ArrowRight,
  ChevronRight, TrendingUp, Shield,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  getEtaPriorities, getStats, getUpcomingEta,
  getPendingBoe, getPendingCbl, getPendingEWayBill,
  getPendingCpl, getPendingLinePayment,
} from "../../api/dashboardApi";
import containerApi from "../../api/containerApi";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import { useFetch } from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import { createCrudApi } from "../../api/crudApi";

const activityLogApi = createCrudApi("/activity-logs");

const metricCards = [
  { key: "totalContainers",   label: "Total Containers",     icon: Boxes,         accent: "#6366f1" },
  { key: "upcomingEta",       label: "Upcoming ETA",         icon: CalendarDays,  accent: "#0ea5e9" },
  { key: "todaysTasks",       label: "Today's Tasks",        icon: ListTodo,      accent: "#f59e0b" },
  { key: "doneContainers",    label: "Done",                 icon: CheckCircle2,  accent: "#10b981" },
  { key: "pendingContainers", label: "Pending",              icon: Clock,         accent: "#64748b" },
  { key: "pendingBoe",        label: "Pending BOE",          icon: FileWarning,   accent: "#ef4444" },
  { key: "pendingCbl",        label: "Pending CBL",          icon: FileWarning,   accent: "#ec4899" },
  { key: "pendingEWayBill",   label: "E-Way Bill",           icon: FileWarning,   accent: "#a855f7" },
  { key: "pendingCpl",        label: "Pending CPL",          icon: FileWarning,   accent: "#f97316" },
  { key: "pendingLinePayment",label: "Line Payment",         icon: IndianRupee,   accent: "#14b8a6" },
  { key: "pendingBl",         label: "Pending BL",           icon: AlertTriangle, accent: "#eab308" },
];

const getEtaPriority = (etaValue) => {
  if (!etaValue) return { tone: "green", daysLeft: null, sort: 2 };
  const eta = dayjs(etaValue);
  if (!eta.isValid()) return { tone: "green", daysLeft: null, sort: 2 };
  const daysLeft = eta.startOf("day").diff(dayjs().startOf("day"), "day");
  if (daysLeft <= 7)  return { tone: "red",    daysLeft, sort: 0 };
  if (daysLeft <= 15) return { tone: "yellow", daysLeft, sort: 1 };
  return { tone: "green", daysLeft, sort: 2 };
};

const getContainerNo  = (i) => i.container_no || i.containerNo || "-";
const getImporterName = (i) => i.importer?.name || i.importer_name || "-";

const priorityMeta = {
  red:    { label: "High Priority",   range: "0-7 days",  bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",   dot: "bg-red-500",     bar: "bg-red-400"     },
  yellow: { label: "Medium Priority", range: "8-15 days", bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200", dot: "bg-amber-500",   bar: "bg-amber-400"   },
  green:  { label: "Low Priority",    range: "16+ days",  bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200",dot: "bg-emerald-500", bar: "bg-emerald-400" },
};

const Dashboard = () => {
  const { user } = useAuth();
  const { data, loading }                              = useFetch(getStats, []);
  const { data: etaContainers = [], loading: etaLoad } = useFetch(getEtaPriorities, []);
  const { data: logsData, loading: logsLoad }          = useFetch(
    () => user?.role === "masterAdmin"
      ? activityLogApi.list({ limit: 6, sort: "-createdAt" })
      : Promise.resolve({ data: { items: [] } }),
    [user?.role]
  );

  const navigate = useNavigate();
  const [openModal, setOpenModal]           = useState(false);
  const [modalTitle, setModalTitle]         = useState("");
  const [activeModalKey, setActiveModalKey] = useState("");
  const [modalData, setModalData]           = useState([]);
  const [modalLoading, setModalLoading]     = useState(false);

  const handleCardClick = async (key, label) => {
    setActiveModalKey(key); setModalTitle(label);
    setModalLoading(true);  setOpenModal(true);
    try {
      let list = [];
      if (key === "totalContainers")   { const r = await containerApi.list({ limit: 1000 }); list = r.data?.items || []; }
      else if (key === "upcomingEta")  { const r = await getUpcomingEta();   list = r.data || []; }
      else if (key === "todaysTasks")  {
        const r = await containerApi.list({ limit: 1000 });
        const today = dayjs().startOf("day");
        list = (r.data?.items || []).filter((it) => {
          if (it.status?.toLowerCase() === "done") return false;
          const eta = it.etaDate || it.eta_date ? dayjs(it.etaDate || it.eta_date).startOf("day") : null;
          const unl = it.unloadingDate || it.unloading_date ? dayjs(it.unloadingDate || it.unloading_date).startOf("day") : null;
          return (eta && eta.isSame(today)) || (unl && unl.isSame(today));
        });
      }
      else if (key === "doneContainers")    { const r = await containerApi.list({ status: "done",   limit: 1000 }); list = r.data?.items || []; }
      else if (key === "pendingContainers") { const r = await containerApi.list({ status: "active", limit: 1000 }); list = r.data?.items || []; }
      else if (key === "pendingBoe")        { const r = await getPendingBoe();         list = r.data || []; }
      else if (key === "pendingCbl")        { const r = await getPendingCbl();         list = r.data || []; }
      else if (key === "pendingEWayBill")   { const r = await getPendingEWayBill();    list = r.data || []; }
      else if (key === "pendingCpl")        { const r = await getPendingCpl();         list = r.data || []; }
      else if (key === "pendingLinePayment"){ const r = await getPendingLinePayment();
        list = (r.data || []).map((p) => ({ ...(p.container || {}), pendingAmount: p.pendingAmount })).filter((c) => c._id || c.id); }
      else if (key === "pendingBl")         { const r = await containerApi.list({ status: "active", limit: 1000 });
        list = (r.data?.items || []).filter((it) => !it.blNo && !it.bl_no); }
      setModalData(list);
    } catch (e) { console.error(e); }
    finally { setModalLoading(false); }
  };

  if (loading || etaLoad) return <Loader />;

  const etaRows = [...etaContainers]
    .map((item) => { const eta = item.eta_date || item.etaDate; return { ...item, eta, priority: getEtaPriority(eta) }; })
    .filter((item) => item.status?.toLowerCase() !== "done")
    .sort((a, b) => {
      if (a.priority.sort !== b.priority.sort) return a.priority.sort - b.priority.sort;
      if (!a.eta) return 1; if (!b.eta) return -1;
      return dayjs(a.eta).valueOf() - dayjs(b.eta).valueOf();
    });

  const counts = etaRows.reduce((acc, it) => { acc[it.priority.tone] += 1; return acc; }, { red: 0, yellow: 0, green: 0 });
  const total  = Math.max(counts.red + counts.yellow + counts.green, 1);
  const highRows = etaRows.filter((it) => it.priority.tone === "red");

  return (
    <div className="space-y-5">

      {/* ── Page Title ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operations Center</p>
          <h1 className="mt-0.5 text-xl font-bold text-slate-900">Dashboard</h1>
        </div>
        <Link
          to="/containers"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors px-4 py-2 text-xs font-semibold text-white shadow-sm"
        >
          Containers <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ── ETA Priority Bands ── */}
      <section>
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <Shield className="h-3.5 w-3.5" /> ETA Priority Control
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(priorityMeta).map(([tone, cfg]) => {
            const count = counts[tone] || 0;
            const pct   = Math.min(Math.round((count / total) * 100), 100);
            return (
              <Link
                key={tone}
                to={`/containers?priority=${tone}`}
                className={`group rounded-xl border ${cfg.border} ${cfg.bg} p-4 transition-all hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
                  <span className={`text-[10px] font-medium text-slate-400`}>{cfg.range}</span>
                </div>
                <p className={`mt-2 text-3xl font-extrabold ${cfg.text}`}>{count}</p>
                <p className="text-[10px] text-slate-400 mb-2">containers</p>
                <div className="h-1 w-full rounded-full bg-white/60">
                  <div className={`h-1 rounded-full ${cfg.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">{pct}% distribution</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Metric KPI Cards ── */}
      <section>
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <TrendingUp className="h-3.5 w-3.5" /> Live Metrics
        </p>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {metricCards.map((card) => {
            const Icon = card.icon;
            const val  = data?.[card.key] ?? 0;
            return (
              <button
                key={card.key}
                onClick={() => handleCardClick(card.key, card.label)}
                className="group rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-slate-200 focus:outline-none"
              >
                <div
                  className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${card.accent}18` }}
                >
                  <Icon className="h-4 w-4" style={{ color: card.accent }} />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 leading-tight">{card.label}</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900 tabular-nums">{val}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── High Priority Containers ── */}
      <section className="rounded-xl border border-red-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-red-100 bg-red-50/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">High Priority Containers</span>
          </div>
          <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
            {highRows.length} containers
          </span>
        </div>

        {highRows.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <p className="text-xs font-semibold">No high priority containers right now</p>
          </div>
        ) : (
          <>
            {/* Desktop header */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_1.5fr_1fr_0.7fr_0.8fr] border-b border-slate-50 bg-slate-50 px-4 py-2">
              {["Container", "Importer", "ETA Date", "Days Left", "Status"].map((h) => (
                <p key={h} className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</p>
              ))}
            </div>
            <div className="divide-y divide-slate-50">
              {highRows.map((item) => {
                const dl      = item.priority.daysLeft ?? 0;
                const overdue = dl < 0;
                const label   = overdue ? `Overdue ${Math.abs(dl)}d` : `${dl}d left`;
                return (
                  <Link
                    key={item.id || item._id}
                    to={`/containers?edit=${item._id || item.id}`}
                    className="flex flex-col gap-1.5 px-4 py-3 hover:bg-red-50/20 transition-colors lg:grid lg:grid-cols-[1fr_1.5fr_1fr_0.7fr_0.8fr] lg:items-center"
                  >
                    <p className="text-sm font-bold text-slate-900">{getContainerNo(item)}</p>
                    <p className="text-xs text-slate-600">{getImporterName(item)}</p>
                    <p className="text-xs text-slate-500">{item.eta ? dayjs(item.eta).format("DD MMM YYYY") : "-"}</p>
                    <span className={`inline-flex w-fit rounded-md px-2 py-0.5 text-[10px] font-bold border ${overdue ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                      {label}
                    </span>
                    <p className="text-xs text-slate-600 capitalize">{item.status || "-"}</p>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* ── Activity Audit Log (masterAdmin only) ── */}
      {user?.role === "masterAdmin" && (
        <section className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-indigo-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Activity</span>
            </div>
            <Link to="/activity-logs" className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {logsLoad ? (
              <div className="flex justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
              </div>
            ) : logsData?.items?.length > 0 ? (
              logsData.items.map((log) => {
                const isDel = log.action?.toLowerCase().includes("delete") || log.action?.toLowerCase().includes("remove");
                const isUpd = log.action?.toLowerCase().includes("update") || log.action?.toLowerCase().includes("edit");
                const pillCls = isDel
                  ? "bg-red-50 text-red-700 border-red-100"
                  : isUpd ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-blue-50 text-blue-700 border-blue-100";
                return (
                  <div key={log._id || log.id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${pillCls}`}>
                        {log.action || "CRUD"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{log.description}</p>
                        <p className="text-[10px] text-slate-400">
                          {log.module || "General"} · <span className="font-semibold text-slate-600">{log.user?.name || "System"}</span>
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] text-slate-400 whitespace-nowrap">
                      {dayjs(log.createdAt || log.created_at).format("DD MMM, hh:mm A")}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center text-xs font-semibold text-slate-400">
                No activities logged yet
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Detail Modal ── */}
      <Modal open={openModal} title={modalTitle} subtitle="Metric Details" onClose={() => setOpenModal(false)}>
        {modalLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          </div>
        ) : modalData.length === 0 ? (
          <p className="py-10 text-center text-sm font-semibold text-slate-400">No records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Container No</th>
                  <th className="px-4 py-3">Importer</th>
                  <th className="px-4 py-3">ETA</th>
                  <th className="px-4 py-3">{activeModalKey === "pendingLinePayment" ? "Pending Amt" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {modalData.map((item) => (
                  <tr
                    key={item._id || item.id}
                    onClick={() => { setOpenModal(false); navigate(`/containers?edit=${item._id || item.id}`); }}
                    className="cursor-pointer hover:bg-indigo-50/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-indigo-600">{item.containerNo || item.container_no || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{item.importer?.name || item.importer_name || item.importer || "-"}</td>
                    <td className="px-4 py-3 text-slate-500">{item.etaDate || item.eta_date ? dayjs(item.etaDate || item.eta_date).format("DD MMM YYYY") : "-"}</td>
                    <td className="px-4 py-3">
                      {activeModalKey === "pendingLinePayment" ? (
                        <span className="font-bold text-red-600">₹{item.pendingAmount || 0}</span>
                      ) : (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                          item.status === "done" ? "bg-emerald-50 text-emerald-700" :
                          item.status === "inTransit" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                        }`}>{item.status || "Pending"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
