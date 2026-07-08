import { useEffect, useState } from "react";
import dayjs from "dayjs";
import containerApi from "../../api/containerApi";
import TopBar from "../../components/layout/TopBar";
import Loader from "../../components/common/Loader";
import { BarChart3, TrendingUp, Users, Calendar, ArrowLeftRight, Percent } from "lucide-react";

const AnalyticsPage = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month()); // 0-11
  const [selectedYear, setSelectedYear] = useState(dayjs().year());

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const res = await containerApi.list({ limit: 1000 });
        setContainers(res.data?.items || []);
      } catch (error) {
        console.error("Error fetching containers for analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContainers();
  }, []);

  if (loading) return <Loader />;

  const currentYear = dayjs().year();
  const currentMonth = dayjs().month();

  // Helper to parse date
  const getContainerLoadDate = (item) => {
    const d = item.loadingDate || item.loading_date || item.createdAt;
    return d ? dayjs(d) : null;
  };

  // 1. Last Month vs This Month
  const thisMonthContainers = containers.filter((item) => {
    const date = getContainerLoadDate(item);
    return date && date.year() === currentYear && date.month() === currentMonth;
  });

  const lastMonthContainers = containers.filter((item) => {
    const date = getContainerLoadDate(item);
    const lastMonthDate = dayjs().subtract(1, "month");
    return date && date.year() === lastMonthDate.year() && date.month() === lastMonthDate.month();
  });

  const thisMonthCount = thisMonthContainers.length;
  const lastMonthCount = lastMonthContainers.length;

  // Calculate percentage change
  let pctChange = 0;
  if (lastMonthCount > 0) {
    pctChange = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
  } else if (thisMonthCount > 0) {
    pctChange = 100;
  }

  // 2. Monthly Loads since January of Current Year
  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthlyData = monthsList.map((name, index) => {
    const count = containers.filter((item) => {
      const date = getContainerLoadDate(item);
      return date && date.year() === currentYear && date.month() === index;
    }).length;
    return { name, count };
  });

  const maxMonthCount = Math.max(...monthlyData.map((d) => d.count), 1);

  // 3. Top Parties / Customers since January
  const partyCountsMap = {};
  containers.forEach((item) => {
    const date = getContainerLoadDate(item);
    if (date && date.year() === currentYear) {
      const party = item.party || item.importer?.name || item.importer_name || "Unknown Party";
      partyCountsMap[party] = (partyCountsMap[party] || 0) + 1;
    }
  });

  const topParties = Object.entries(partyCountsMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 customers

  const maxPartyCount = Math.max(...topParties.map((p) => p.count), 1);

  // 4. Weekly load breakdown of selected month
  const selectedMonthContainers = containers.filter((item) => {
    const date = getContainerLoadDate(item);
    return date && date.year() === selectedYear && date.month() === selectedMonth;
  });

  const weeksData = [
    { name: "Week 1 (1-7)", count: 0 },
    { name: "Week 2 (8-14)", count: 0 },
    { name: "Week 3 (15-21)", count: 0 },
    { name: "Week 4 (22+)", count: 0 },
  ];

  selectedMonthContainers.forEach((item) => {
    const date = getContainerLoadDate(item);
    if (date) {
      const day = date.date();
      if (day >= 1 && day <= 7) weeksData[0].count++;
      else if (day >= 8 && day <= 14) weeksData[1].count++;
      else if (day >= 15 && day <= 21) weeksData[2].count++;
      else weeksData[3].count++;
    }
  });

  const maxWeekCount = Math.max(...weeksData.map((w) => w.count), 1);

  return (
    <div className="space-y-6">
      <TopBar title="Container Load Analytics" />

      {/* Top Section: Last Month vs This Month */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="inline-flex rounded-xl bg-slate-100 p-2 text-slate-700 mb-4">
              <Calendar className="h-5 w-5" />
            </span>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Last Month Loads</p>
            <h3 className="mt-2 text-4xl font-black text-slate-950">
              {lastMonthCount} <span className="text-lg font-bold text-slate-400">Containers</span>
            </h3>
          </div>
          <p className="mt-4 text-xs font-bold text-slate-500">
            For {dayjs().subtract(1, "month").format("MMMM YYYY")}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="inline-flex rounded-xl bg-brand-50 p-2 text-brand-600 mb-4">
              <TrendingUp className="h-5 w-5" />
            </span>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">This Month Loads</p>
            <h3 className="mt-2 text-4xl font-black text-slate-950">
              {thisMonthCount} <span className="text-lg font-bold text-slate-400">Containers</span>
            </h3>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              For {dayjs().format("MMMM YYYY")}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              pctChange >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}>
              {pctChange >= 0 ? `+${pctChange}%` : `${pctChange}%`}
            </span>
          </div>
        </div>

        {/* Visual comparison bar card */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="inline-flex rounded-xl bg-indigo-50 p-2 text-indigo-600 mb-4">
              <ArrowLeftRight className="h-5 w-5" />
            </span>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Comparison Status</p>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Last Month ({lastMonthCount})</span>
                <span>This Month ({thisMonthCount})</span>
              </div>
              <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden flex">
                {lastMonthCount + thisMonthCount > 0 ? (
                  <>
                    <div 
                      className="bg-slate-400 transition-all duration-500" 
                      style={{ width: `${(lastMonthCount / (lastMonthCount + thisMonthCount)) * 100}%` }}
                    />
                    <div 
                      className="bg-brand-600 transition-all duration-500" 
                      style={{ width: `${(thisMonthCount / (lastMonthCount + thisMonthCount)) * 100}%` }}
                    />
                  </>
                ) : (
                  <div className="w-full bg-slate-200" />
                )}
              </div>
            </div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Live loading comparison graph
          </p>
        </div>
      </section>

      {/* Middle Section: Bar Chart & Top Importers */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Loads since January */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-600">Month-Wise Load</p>
              <h2 className="text-xl font-black text-slate-950">Loads Since January</h2>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>

          <div className="flex h-64 items-end gap-3 px-2 pt-4">
            {monthlyData.map((d) => {
              const heightPercent = Math.round((d.count / maxMonthCount) * 100);
              return (
                <div key={d.name} className="group flex flex-1 flex-col items-center gap-2 h-full justify-end">
                  <span className="opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] font-black py-1 px-1.5 rounded transition-opacity duration-200">
                    {d.count}
                  </span>
                  <div 
                    className="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-indigo-500 hover:from-brand-600 hover:to-indigo-600 transition-all duration-500"
                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                  />
                  <span className="text-[10px] font-bold text-slate-500 rotate-45 md:rotate-0 origin-left">
                    {d.name.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Importers / Customers */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-600">Customer Share</p>
              <h2 className="text-xl font-black text-slate-950">Top Customers (This Year)</h2>
            </div>
            <Users className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {topParties.map((p, idx) => {
              const widthPercent = Math.round((p.count / maxPartyCount) * 100);
              return (
                <div key={p.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm font-bold text-slate-950">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs font-black">#{idx + 1}</span>
                      <span className="truncate max-w-[200px] sm:max-w-xs">{p.name}</span>
                    </div>
                    <span>{p.count} Loads</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-brand-500 transition-all duration-500"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {topParties.length === 0 && (
              <div className="py-10 text-center text-slate-500">
                No customer load data available for this year.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bottom Section: Weekly breakdown with selector */}
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-600">Time-Slot Analysis</p>
            <h2 className="text-xl font-black text-slate-950">Week-Wise Load Breakdown</h2>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {monthsList.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value={currentYear}>{currentYear}</option>
              <option value={currentYear - 1}>{currentYear - 1}</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 pt-4">
          {weeksData.map((w) => {
            const heightPercent = Math.round((w.count / maxWeekCount) * 100);
            return (
              <div key={w.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex flex-col items-center justify-between gap-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">{w.name}</p>
                <div className="flex items-end justify-center w-full h-32">
                  <div 
                    className="w-16 rounded-t-lg bg-gradient-to-t from-teal-500 to-emerald-500 transition-all duration-500"
                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                  />
                </div>
                <div className="text-center">
                  <h4 className="text-2xl font-black text-slate-950">{w.count}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Containers</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage;
