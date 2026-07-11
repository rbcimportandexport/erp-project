import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import containerApi from "../../api/containerApi";
import importerApi from "../../api/importerApi";
import exporterApi from "../../api/exporterApi";
import hsnApi from "../../api/hsnApi";
import Button from "../../components/common/Button";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import ResourcePage from "../ResourcePage";

const statusOptions = [
  "BL",
  "BOE",
  "CBL",
  "CFS PAYMENT",
  "CHA PHOTO FILE",
  "CHECKLIST",
  "CPL",
  "DONE",
  "DUTY",
  "E-WAY BILL",
  "ECPL",
  "FECPL",
  "LINE PAYMENT",
  "MD",
  "P&I",
  "HOLD AT CHA",
  "HOLD AT PARTY",
  "HOLD AT SIR",
  "HOLD AT ME",
  "WORK NOT STARTED",
  "AWATING FOR CHECKLIST",
  "CHECKLIST APPROVED",
  "HOLD AT ANSHU",
].map((val) => ({ value: val, label: val }));

const partyOptions = [
  "RBC",
  "Rama",
  "Shreeji",
  "Shivay",
].map((value) => ({ value, label: value }));

const chaOptions = [
  "Ocenus",
  "Mountain",
].map((value) => ({ value, label: value }));

const shippingLineOptions = [
  "HAL",
  "YML",
  "SNL",
  "EMC",
  "OOCL",
  "HAS",
  "KMTC",
  "MSC",
  "ONE",
  "HMM",
  "COSCO",
  "PEAK",
].map((value) => ({ value, label: value }));

const portOfChinaOptions = [
  "NINGBO",
  "NANSHA",
  "WUHAN",
].map((value) => ({ value, label: value }));

const documentProcessedOptions = [
  "Yes",
  "No",
  "PENDING",
  "Done",
].map((value) => ({ value, label: value }));

const getEtaPriority = (etaValue) => {
  if (!etaValue) return { label: "Low", tone: "green" };
  const eta = dayjs(etaValue);
  if (!eta.isValid()) return { label: "Low", tone: "green" };

  const diff = eta.startOf("day").diff(dayjs().startOf("day"), "day");
  if (diff <= 7) return { label: "High", tone: "red" };
  if (diff <= 15) return { label: "Medium", tone: "yellow" };
  return { label: "Low", tone: "green" };
};

const getPriorityRowClassName = (row) => {
  const normStatus = (row.status || "").trim().toLowerCase();
  if (normStatus === "done") {
    return "bg-slate-50 text-slate-400 hover:bg-slate-100 ring-1 ring-slate-200";
  }
  const priority = getEtaPriority(row.eta_date || row.etaDate);
  if (priority.tone === "red") return "bg-red-100 ring-1 ring-red-200 hover:bg-red-200";
  if (priority.tone === "yellow") return "bg-amber-100 ring-1 ring-amber-200 hover:bg-amber-200";
  if (priority.tone === "green") return "bg-emerald-100 ring-1 ring-emerald-200 hover:bg-emerald-200";
  return "bg-white ring-1 ring-slate-200 hover:bg-slate-50";
};

const getPriorityCounts = (items) => items.reduce((acc, item) => {
  const normStatus = (item.status || "").trim().toLowerCase();
  if (normStatus === "done") return acc;
  const priority = getEtaPriority(item.eta_date || item.etaDate);
  acc[priority.tone] = (acc[priority.tone] || 0) + 1;
  return acc;
}, { red: 0, yellow: 0, green: 0 });

const ContainerList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [importers, setImporters] = useState([]);
  const [exporters, setExporters] = useState([]);
  const [hsnCodes, setHsnCodes] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [missingField, setMissingField] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [impRes, expRes, hsnRes] = await Promise.all([
          importerApi.list({ limit: 1000 }),
          exporterApi.list({ limit: 1000 }),
          hsnApi.list({ limit: 1000 }),
        ]);

        const sortByName = (a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
        const sortByCode = (a, b) => (a.code || "").localeCompare(b.code || "", undefined, { sensitivity: "base" });

        const sortedImporters = (impRes.data?.items || []).sort(sortByName).map((item) => ({
          value: item._id,
          label: item.name,
        }));

        const sortedExporters = (expRes.data?.items || []).sort(sortByName).map((item) => ({
          value: item._id,
          label: item.name,
        }));

        const sortedHsn = (hsnRes.data?.items || []).sort(sortByCode).map((item) => ({
          value: item._id,
          label: item.code,
        }));

        setImporters(sortedImporters);
        setExporters(sortedExporters);
        setHsnCodes(sortedHsn);
      } catch (err) {
        console.error("Error loading container select options:", err);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);


  return (
    <ResourcePage
      title="Containers"
      api={containerApi}
      getRowClassName={getPriorityRowClassName}
      tableVariant="cards"
      filters={{ missing: missingField, status: statusFilter }}
      renderHeader={({ items, openAdd, search, setSearch }) => {
        const counts = getPriorityCounts(items);
        return (
          <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm animate-fade-in-up">
            <div className="bg-[#0f172a] px-6 py-6 text-white">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Shipment Board</p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight">Containers</h1>
                  <p className="mt-1 text-xs text-slate-400">Container number par click karo, edit direct open hoga.</p>
                </div>
                <Button className="h-10 rounded-xl px-5 text-xs font-semibold" onClick={openAdd}>Add Container</Button>
              </div>
            </div>

            <div className="grid gap-px bg-slate-100 border-b border-slate-100 md:grid-cols-4">
              <div className="bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Visible Records</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{items.length}</p>
              </div>
              <div className="bg-white p-4 border-l border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-500">High Priority</p>
                <p className="mt-1 text-2xl font-bold text-rose-600">{counts.red}</p>
              </div>
              <div className="bg-white p-4 border-l border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">Medium Priority</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">{counts.yellow}</p>
              </div>
              <div className="bg-white p-4 border-l border-slate-100">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">Low Priority</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">{counts.green}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 p-4">
              <div className="flex-1">
                <SearchBar value={search} onChange={setSearch} placeholder="Search container number" />
              </div>
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-50 font-medium text-slate-700"
                >
                  <option value="active">Active Containers</option>
                  <option value="done">Completed (Done)</option>
                  <option value="">All Containers</option>
                </select>
              </div>
              <div className="w-full md:w-64">
                <select
                  value={missingField}
                  onChange={(e) => setMissingField(e.target.value)}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-50 font-medium text-slate-700"
                >
                  <option value="">Filter Missing Fields...</option>
                  <option value="etaDate">⚠️ Missing ETA Date</option>
                  <option value="blNo">⚠️ Missing BL No</option>
                  <option value="party">⚠️ Missing Party</option>
                  <option value="cha">⚠️ Missing CHA</option>
                  <option value="shippingLine">⚠️ Missing Shipping Line</option>
                  <option value="portOfChina">⚠️ Missing Port Of China</option>
                  <option value="loadingDate">⚠️ Missing Loading Date</option>
                  <option value="unloadingDate">⚠️ Missing Unloading Date</option>
                </select>
              </div>
            </div>
          </div>
        );
      }}
      openEditId={searchParams.get("edit")}
      onEditClosed={() => {
        if (searchParams.has("edit")) setSearchParams({}, { replace: true });
      }}
      fields={[
        { name: "containerNo", label: "Container No", required: true },
        { name: "importer", label: "Importer", type: "select", options: importers, required: true },
        { name: "exporter", label: "Exporter", type: "select", options: exporters, required: true },
        { name: "hsnCode", label: "HSN Code", type: "select", options: hsnCodes },
        { name: "loadingDate", label: "Loading Date", type: "date" },
        { name: "loadingDays", label: "Loading Days" },
        { name: "party", label: "Party", type: "select", options: partyOptions },
        { name: "cha", label: "CHA", type: "select", options: chaOptions },
        { name: "shippingLine", label: "Shipping Line", type: "select", options: shippingLineOptions },
        { name: "portOfChina", label: "Port Of China", type: "select", options: portOfChinaOptions },
        { name: "blNo", label: "BL No" },
        { name: "etaDate", label: "ETA Date", type: "date" },
        { name: "etaDays", label: "ETA Days" },
        { name: "unloadingDate", label: "Unloading Date", type: "date" },
        { name: "status", label: "Status", type: "select", options: statusOptions },
        { name: "documentProcessed", label: "Document Processed", type: "select", options: documentProcessedOptions },
        { name: "remarks", label: "Remarks" },
      ]}
      columns={[
        {
          header: "Container",
          accessorKey: "container_no",
          cell: ({ row, table }) => (
            <button
              type="button"
              className="rounded-xl bg-white px-3 py-2 text-left font-black text-brand-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-950 hover:text-white hover:ring-slate-950"
              onClick={() => table.options.meta?.openEdit?.(row.original)}
            >
              {row.original.container_no || row.original.containerNo}
            </button>
          ),
        },
        { header: "Importer", accessorFn: (row) => row.importer?.name || "" },
        { header: "Party", accessorKey: "party", cell: ({ row }) => row.original.party || "-" },
        { header: "CHA", accessorKey: "cha", cell: ({ row }) => row.original.cha || "-" },
        { header: "Shipping", accessorKey: "shipping_line", cell: ({ row }) => row.original.shipping_line || row.original.shippingLine || "-" },
        { header: "Port Of China", accessorKey: "port_of_china", cell: ({ row }) => row.original.port_of_china || row.original.portOfChina || "-" },
        { header: "BL No", accessorKey: "bl_no", cell: ({ row }) => row.original.bl_no || row.original.blNo || "-" },
        { header: "ETA", accessorKey: "eta_date", cell: ({ row }) => row.original.eta_date || row.original.etaDate ? dayjs(row.original.eta_date || row.original.etaDate).format("DD MMM YYYY") : "-" },
        {
          header: "Priority",
          cell: ({ row }) => {
            const priority = getEtaPriority(row.original.eta_date || row.original.etaDate);
            return (
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                priority.tone === "red"
                  ? "bg-red-100 text-red-700"
                  : priority.tone === "yellow"
                    ? "bg-yellow-100 text-yellow-700"
                    : priority.tone === "green"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
              }`}>
                {priority.label}
              </span>
            );
          },
        },
        { header: "Status", accessorKey: "status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
        { header: "Doc", accessorKey: "document_processed", cell: ({ row }) => row.original.document_processed || row.original.documentProcessed || "-" },
      ]}
    />
  );
};

export default ContainerList;
