import { Boxes, CalendarDays, CheckCircle2, Clock, FileWarning, IndianRupee, ListTodo } from "lucide-react";
import { getStats } from "../../api/dashboardApi";
import Loader from "../../components/common/Loader";
import TopBar from "../../components/layout/TopBar";
import { useFetch } from "../../hooks/useFetch";

const cards = [
  { key: "totalContainers", label: "Total Containers", icon: Boxes },
  { key: "upcomingEta", label: "Upcoming Container ETA", icon: CalendarDays },
  { key: "todaysTasks", label: "Today's Tasks", icon: ListTodo },
  { key: "doneContainers", label: "Containers Done", icon: CheckCircle2 },
  { key: "pendingContainers", label: "Pending Containers", icon: Clock },
  { key: "pendingBoe", label: "Pending BOE", icon: FileWarning },
  { key: "pendingLinePayment", label: "Pending Line Payment", icon: IndianRupee },
];

const Dashboard = () => {
  const { data, loading } = useFetch(getStats, []);

  if (loading) return <Loader />;

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <section key={card.key} className="rounded-md bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{data?.[card.key] ?? 0}</p>
                </div>
                <div className="rounded-md bg-brand-50 p-3 text-brand-600"><Icon className="h-6 w-6" /></div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
};

export default Dashboard;
