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
import { Link } from "react-router-dom";
import { getEtaPriorities, getStats } from "../../api/dashboardApi";
import Loader from "../../components/common/Loader";
import TopBar from "../../components/layout/TopBar";
import { useFetch } from "../../hooks/useFetch";

const metricCards = [
  { key: "totalContainers", label: "Total Containers", icon: Boxes },
  { key: "upcomingEta", label: "Upcoming ETA", icon: CalendarDays },
  { key: "todaysTasks", label: "Today's Tasks", icon: ListTodo },
  { key: "doneContainers", label: "Containers Done", icon: CheckCircle2 },
  { key: "pendingContainers", label: "Pending Containers", icon: Clock },
  { key: "pendingBoe", label: "Pending BOE", icon: FileWarning },
  { key: "pendingLinePayment", label: "Pending Line Payment", icon: IndianRupee },
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

  if (loading || etaLoading) return <Loader />;

  const etaRows = [...etaContainers]
    .map((item) => {
      const eta = item.eta_date || item.etaDate;
      return { ...item, eta, priority: getEtaPriority(eta) };
    })
    .filter((item) => item.eta)
    .sort((a, b) => {
      if (a.priority.sort !== b.priority.sort) return a.priority.sort - b.priority.sort;
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
            <article key={card.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
                  <p className="mt-4 text-4xl font-black leading-none text-slate-950">{data?.[card.key] ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-brand-100 bg-brand-50 p-3 text-brand-700">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-5 overflow-hidden rounded-[28px] border border-red-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-red-100 bg-red-50 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700">Urgent ETA Watch</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">High Priority Containers</h2>
            <p className="mt-1 text-sm font-medium text-slate-600">Yahan sirf 0-7 days ETA wale containers show honge.</p>
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
    </>
  );
};

export default Dashboard;
