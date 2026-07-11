import { useState } from "react";
import dayjs from "dayjs";
import {
  AlertTriangle,
  Boxes,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileWarning,
  IndianRupee,
  ListTodo,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  getEtaPriorities,
  getStats,
  getUpcomingEta,
  getPendingBoe,
  getPendingLinePayment,
} from "../../api/dashboardApi";
import containerApi from "../../api/containerApi";
import Loader from "../../components/common/Loader";
import TopBar from "../../components/layout/TopBar";
import Modal from "../../components/common/Modal";
import { useFetch } from "../../hooks/useFetch";

const metricCards = [
  { key: "totalContainers", label: "Total Containers", icon: Boxes },
  { key: "upcomingEta", label: "Upcoming ETA", icon: CalendarDays },
  { key: "todaysTasks", label: "Today's Tasks", icon: ListTodo },
  { key: "doneContainers", label: "Containers Done", icon: CheckCircle2 },
  { key: "pendingContainers", label: "Pending Containers", icon: Clock },
  { key: "pendingBoe", label: "Pending BOE", icon: FileWarning },
  { key: "pendingLinePayment", label: "Pending Line Payment", icon: IndianRupee },
  { key: "pendingBl", label: "Pending BL", icon: AlertTriangle },
];

const priorityConfig = {
  red: {
    label: "High Priority",
    range: "0-7 days",
    rowClass: "border-red-200 bg-red-50 text-red-700",
    panelClass: "border border-slate-200 border-t-[3px] border-t-rose-500 bg-gradient-to-b from-rose-50/10 to-white",
    badgeClass: "bg-rose-50 text-rose-600 border border-rose-100",
    textClass: "text-rose-600",
    barColorClass: "bg-rose-500",
    sort: 0,
  },
  yellow: {
    label: "Medium Priority",
    range: "8-15 days",
    rowClass: "border-amber-200 bg-amber-50 text-amber-700",
    panelClass: "border border-slate-200 border-t-[3px] border-t-amber-500 bg-gradient-to-b from-amber-50/10 to-white",
    badgeClass: "bg-amber-50 text-amber-600 border border-amber-100",
    textClass: "text-amber-600",
    barColorClass: "bg-amber-500",
    sort: 1,
  },
  green: {
    label: "Low Priority",
    range: "16+ days",
    rowClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    panelClass: "border border-slate-200 border-t-[3px] border-t-emerald-500 bg-gradient-to-b from-emerald-50/10 to-white",
    badgeClass: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    textClass: "text-emerald-600",
    barColorClass: "bg-emerald-500",
    sort: 2,
  },
};

const getEtaPriority = (etaValue) => {
  if (!etaValue) return { tone: "green", daysLeft: null, ...priorityConfig.green };
  const eta = dayjs(etaValue);
  if (!eta.isValid()) return { tone: "green", daysLeft: null, ...priorityConfig.green };

  const daysLeft = eta.startOf("day").diff(dayjs().startOf("day"), "day");
  if (daysLeft <= 7) return { tone: "red", daysLeft, ...priorityConfig.red };
  if (daysLeft <= 15) return { tone: "yellow", daysLeft, ...priorityConfig.yellow };
  return { tone: "green", daysLeft, ...priorityConfig.green };
};

const getContainerNo = (item) => item.container_no || item.containerNo || "-";
const getImporterName = (item) => item.importer?.name || item.importer_name || "-";

const Dashboard = () => {
  const { data, loading } = useFetch(getStats, []);
  const { data: etaContainers = [], loading: etaLoading } = useFetch(getEtaPriorities, []);

  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [activeModalKey, setActiveModalKey] = useState("");
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const handleCardClick = async (key, label) => {
    setActiveModalKey(key);
    setModalTitle(label);
    setModalLoading(true);
    setOpenModal(true);

    try {
      let list = [];
      if (key === "totalContainers") {
        const res = await containerApi.list({ limit: 1000 });
        list = res.data?.items || [];
      } else if (key === "upcomingEta") {
        const res = await getUpcomingEta();
        list = res.data || [];
      } else if (key === "todaysTasks") {
        const res = await containerApi.list({ limit: 1000 });
        const today = dayjs().startOf("day");
        list = (res.data?.items || []).filter((item) => {
          if (item.status?.toLowerCase() === "done") return false;
          const eta = item.etaDate || item.eta_date ? dayjs(item.etaDate || item.eta_date).startOf("day") : null;
          const unloading = item.unloadingDate || item.unloading_date ? dayjs(item.unloadingDate || item.unloading_date).startOf("day") : null;
          return (eta && eta.isSame(today)) || (unloading && unloading.isSame(today));
        });
      } else if (key === "doneContainers") {
        const res = await containerApi.list({ status: "done", limit: 1000 });
        list = res.data?.items || [];
      } else if (key === "pendingContainers") {
        const res = await containerApi.list({ status: "active", limit: 1000 });
        list = res.data?.items || [];
      } else if (key === "pendingBoe") {
        const res = await getPendingBoe();
        list = res.data || [];
      } else if (key === "pendingLinePayment") {
        const res = await getPendingLinePayment();
        list = (res.data || [])
          .map((payment) => ({
            ...(payment.container || {}),
            pendingAmount: payment.pendingAmount,
          }))
          .filter((c) => c._id || c.id);
      } else if (key === "pendingBl") {
        const res = await containerApi.list({ status: "active", limit: 1000 });
        list = (res.data?.items || []).filter((item) => !item.blNo && !item.bl_no);
      }
      setModalData(list);
    } catch (error) {
      console.error("Error fetching modal data:", error);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading || etaLoading) return <Loader />;

  const etaRows = [...etaContainers]
    .map((item) => {
      const eta = item.eta_date || item.etaDate;
      return { ...item, eta, priority: getEtaPriority(eta) };
    })
    .filter((item) => item.status?.toLowerCase() !== "done" && (!item.eta || item.priority.daysLeft >= 0))
    .sort((a, b) => {
      if (a.priority.sort !== b.priority.sort) return a.priority.sort - b.priority.sort;
      if (!a.eta) return 1;
      if (!b.eta) return -1;
      return dayjs(a.eta).valueOf() - dayjs(b.eta).valueOf();
    });

  const priorityCounts = etaRows.reduce(
    (acc, item) => {
      acc[item.priority.tone] += 1;
      return acc;
    },
    { red: 0, yellow: 0, green: 0 },
  );

  const highPriorityRows = etaRows.filter((item) => item.priority.tone === "red");

  return (
    <>
      <TopBar title="Dashboard" />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">ETA Priority Control</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Dashboard</h1>
          </div>

          <Link
            to="/containers"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-600 active:scale-[0.98]"
          >
            Open Containers
          </Link>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {Object.entries(priorityConfig).map(([tone, config]) => {
            const count = priorityCounts[tone] || 0;
            const totalVal = data?.totalContainers || (priorityCounts.red + priorityCounts.yellow + priorityCounts.green) || 1;
            const percentage = Math.min(Math.round((count / totalVal) * 100), 100);
            
            return (
              <Link
                key={tone}
                to="/containers"
                className={`group relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${config.panelClass}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.badgeClass}`}>
                      {config.range}
                    </span>
                    <h2 className="mt-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{config.label}</h2>
                  </div>
                  <div className={`rounded-lg p-2 ${config.badgeClass} group-hover:scale-110 transition-transform duration-200`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </div>
                
                <div className="mt-4 flex items-baseline gap-2">
                  <span className={`text-4xl font-extrabold tracking-tight ${config.textClass}`}>{count}</span>
                  <span className="text-xs font-semibold text-slate-400">containers</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1.5">
                    <span>Distribution</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div 
                      className={`h-1.5 rounded-full ${config.barColorClass} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              onClick={() => handleCardClick(card.key, card.label)}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-brand-300 hover:-translate-y-0.5 active:scale-[0.98] text-left w-full block focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-450">{card.label}</p>
                  <p className="mt-3 text-3xl font-bold leading-none text-slate-900">{data?.[card.key] ?? 0}</p>
                </div>
                <div className="rounded-xl border border-brand-100 bg-brand-50 p-2.5 text-brand-600">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </button>
          );
        })}
      </section>

      <section className="mt-5 overflow-hidden rounded-xl border border-red-150 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-red-100 bg-red-50/30 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">Urgent ETA Watch</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">High Priority Containers</h2>
          </div>
          <span className="inline-flex w-fit rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
            {highPriorityRows.length} High Priority
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {highPriorityRows.map((item) => {
            const daysLeft = Math.max(item.priority.daysLeft ?? 0, 0);
            return (
              <Link
                key={item.id || item._id}
                to={`/containers?edit=${item._id || item.id}`}
                className="block bg-white hover:bg-slate-50/60 px-5 py-4 text-slate-900 transition-all lg:grid lg:gap-4 lg:grid-cols-[1.1fr_1.4fr_1fr_0.8fr_0.8fr]"
              >
                {/* Mobile Card Layout (Hidden on Desktop) */}
                <div className="flex flex-col gap-2 lg:hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 tracking-tight">{getContainerNo(item)}</span>
                    <span className="rounded-lg bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                      {daysLeft} days left
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Importer: <span className="font-semibold text-slate-900 normal-case">{getImporterName(item)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-550 pt-1.5 border-t border-slate-100">
                    <span>ETA: {dayjs(item.eta).format("DD MMM YYYY")}</span>
                    <span className="capitalize text-slate-800 font-semibold">Status: {item.status || "-"}</span>
                  </div>
                </div>

                {/* Desktop Layout (Hidden on Mobile) */}
                <div className="hidden lg:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Container</p>
                  <p className="mt-0.5 text-base font-bold text-slate-900">{getContainerNo(item)}</p>
                </div>
                <div className="hidden lg:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Importer</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-800">{getImporterName(item)}</p>
                </div>
                <div className="hidden lg:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">ETA</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-800">{dayjs(item.eta).format("DD MMM YYYY")}</p>
                </div>
                <div className="hidden lg:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Days Left</p>
                  <p className="mt-0.5 text-sm font-semibold text-red-600">{daysLeft} days</p>
                </div>
                <div className="hidden lg:block">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Status</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-800 capitalize">{item.status || "-"}</p>
                </div>
              </Link>
            );
          })}

          {highPriorityRows.length === 0 && (
            <div className="px-5 py-10 text-center bg-white">
              <p className="text-sm font-semibold text-slate-500">No high priority containers right now</p>
            </div>
          )}
        </div>
      </section>

      <Modal
        open={openModal}
        title={modalTitle}
        subtitle="Metric Details"
        onClose={() => setOpenModal(false)}
      >
        {modalLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {modalData.length === 0 ? (
              <p className="py-8 text-center text-sm font-bold text-slate-500">No records found matching this metric.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Container No</th>
                    <th className="py-3 px-4">Importer</th>
                    <th className="py-3 px-4">ETA</th>
                    {activeModalKey === "pendingLinePayment" ? (
                      <th className="py-3 px-4">Pending Amount</th>
                    ) : (
                      <th className="py-3 px-4">Status</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {modalData.map((item) => (
                    <tr
                      key={item._id || item.id}
                      onClick={() => {
                        setOpenModal(false);
                        navigate(`/containers?edit=${item._id || item.id}`);
                      }}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-brand-600 hover:underline">
                        {item.containerNo || item.container_no || "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {item.importer?.name || item.importer_name || item.importer || "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.etaDate || item.eta_date ? dayjs(item.etaDate || item.eta_date).format("DD MMM YYYY") : "-"}
                      </td>
                      {activeModalKey === "pendingLinePayment" ? (
                        <td className="py-3 px-4 font-bold text-red-600">
                          ₹{item.pendingAmount || 0}
                        </td>
                      ) : (
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                            item.status === "done" ? "bg-emerald-50 text-emerald-700" :
                            item.status === "inTransit" ? "bg-blue-50 text-blue-700" :
                            "bg-amber-50 text-amber-700"
                          }`}>
                            {item.status || "Pending"}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default Dashboard;
