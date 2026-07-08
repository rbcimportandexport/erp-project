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
    rowClass: "border-red-200 bg-red-100",
    panelClass: "border-red-300 bg-red-600 text-white",
    badgeClass: "bg-red-700 text-white",
    sort: 0,
  },
  yellow: {
    label: "Medium Priority",
    range: "8-15 days",
    rowClass: "border-amber-200 bg-amber-100",
    panelClass: "border-amber-300 bg-amber-400 text-amber-950",
    badgeClass: "bg-amber-600 text-white",
    sort: 1,
  },
  green: {
    label: "Low Priority",
    range: "16+ days",
    rowClass: "border-emerald-200 bg-emerald-100",
    panelClass: "border-emerald-300 bg-emerald-500 text-emerald-950",
    badgeClass: "bg-emerald-700 text-white",
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
          const eta = item.etaDate || item.eta_date ? dayjs(item.etaDate || item.eta_date).startOf("day") : null;
          const unloading = item.unloadingDate || item.unloading_date ? dayjs(item.unloadingDate || item.unloading_date).startOf("day") : null;
          return (eta && eta.isSame(today)) || (unloading && unloading.isSame(today));
        });
      } else if (key === "doneContainers") {
        const res = await containerApi.list({ status: "done", limit: 1000 });
        list = res.data?.items || [];
      } else if (key === "pendingContainers") {
        const res = await containerApi.list({ limit: 1000 });
        list = (res.data?.items || []).filter((item) => item.status?.toLowerCase() !== "done");
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
        const res = await containerApi.list({ limit: 1000 });
        list = (res.data?.items || []).filter((item) => item.status?.toLowerCase() !== "done" && !item.blNo && !item.bl_no);
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

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">ETA Priority Control</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Dashboard</h1>
          </div>

          <Link
            to="/containers"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-sm transition hover:bg-brand-700"
          >
            Open Containers
          </Link>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {Object.entries(priorityConfig).map(([tone, config]) => (
            <Link
              key={tone}
              to="/containers"
              className={`relative overflow-hidden rounded-[24px] border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${config.panelClass}`}
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/20" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">{config.range}</p>
                  <h2 className="mt-2 text-xl font-black">{config.label}</h2>
                </div>
                <AlertTriangle className="h-7 w-7 opacity-80" />
              </div>
              <p className="relative mt-6 text-5xl font-black leading-none">{priorityCounts[tone]}</p>
              <p className="relative mt-2 text-sm font-bold opacity-80">containers</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              onClick={() => handleCardClick(card.key, card.label)}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-brand-400 hover:-translate-y-0.5 active:scale-[0.98] text-left w-full block focus:outline-none focus:ring-2 focus:ring-brand-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
                  <p className="mt-4 text-4xl font-black leading-none text-slate-950">{data?.[card.key] ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-brand-100 bg-brand-50 p-3 text-brand-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </button>
          );
        })}
      </section>

      <section className="mt-5 overflow-hidden rounded-[28px] border border-red-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-red-100 bg-red-50 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Urgent ETA Watch</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">High Priority Containers</h2>
          </div>
          <span className="inline-flex w-fit rounded-2xl bg-red-700 px-4 py-2 text-sm font-black text-white">
            {highPriorityRows.length} High Priority
          </span>
        </div>

        <div className="divide-y divide-red-100">
          {highPriorityRows.map((item) => {
            const daysLeft = Math.max(item.priority.daysLeft ?? 0, 0);
            return (
              <Link
                key={item.id || item._id}
                to={`/containers?edit=${item._id || item.id}`}
                className="grid gap-4 bg-red-100 px-5 py-4 text-slate-950 transition hover:bg-red-200 lg:grid-cols-[1.1fr_1.4fr_1fr_0.8fr_0.8fr]"
              >
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-700">Container</p>
                  <p className="mt-1 text-lg font-black text-red-950">{getContainerNo(item)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-700">Importer</p>
                  <p className="mt-1 font-bold">{getImporterName(item)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-700">ETA</p>
                  <p className="mt-1 font-bold">{dayjs(item.eta).format("DD MMM YYYY")}</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-700">Days Left</p>
                  <p className="mt-1 font-black">{daysLeft} days</p>
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-red-700">Status</p>
                  <p className="mt-1 font-bold capitalize">{item.status || "-"}</p>
                </div>
              </Link>
            );
          })}

          {highPriorityRows.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-lg font-black text-slate-950">No high priority containers right now</p>
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
