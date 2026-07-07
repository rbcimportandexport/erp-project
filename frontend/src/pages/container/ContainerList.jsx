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
  { value: "pending", label: "Pending" },
  { value: "inTransit", label: "In Transit" },
  { value: "arrived", label: "Arrived" },
  { value: "cleared", label: "Cleared" },
  { value: "done", label: "Done" },
];

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
  if (!etaValue) return { label: "-", tone: "slate" };
  const eta = dayjs(etaValue);
  if (!eta.isValid()) return { label: "-", tone: "slate" };

  const diff = eta.startOf("day").diff(dayjs().startOf("day"), "day");
  if (diff <= 7) return { label: "High", tone: "red" };
  if (diff <= 15) return { label: "Medium", tone: "yellow" };
  return { label: "Low", tone: "green" };
};

const getPriorityRowClassName = (row) => {
  if (row.status === "done") return "bg-white ring-1 ring-slate-200 hover:bg-slate-50";
  const priority = getEtaPriority(row.eta_date || row.etaDate);
  if (priority.tone === "red") return "bg-red-100 ring-1 ring-red-200 hover:bg-red-200";
  if (priority.tone === "yellow") return "bg-amber-100 ring-1 ring-amber-200 hover:bg-amber-200";
  if (priority.tone === "green") return "bg-emerald-100 ring-1 ring-emerald-200 hover:bg-emerald-200";
  return "bg-white ring-1 ring-slate-200 hover:bg-slate-50";
};

const getPriorityCounts = (items) => items.reduce((acc, item) => {
  if (item.status === "done") return acc;
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

  if (loadingOptions) {
    return (
      <div className="flex h-40 items-center justify-center">
        <span className="text-sm text-slate-500 animate-pulse">Loading dropdown options...</span>
      </div>
    );
  }

  return (
    <ResourcePage
      title="Containers"
      api={containerApi}
      getRowClassName={getPriorityRowClassName}
      tableVariant="cards"
      renderHeader={({ items, openAdd, search, setSearch }) => {
        const counts = getPriorityCounts(items);
        return (
          <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-950 px-6 py-6 text-white">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-brand-50">Shipment Board</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight">Containers</h1>
                  <p className="mt-2 text-sm text-slate-300">Container number par click karo, edit direct open hoga.</p>
                </div>
                <Button className="h-11 rounded-xl px-5" onClick={openAdd}>Add Container</Button>
              </div>
            </div>

            <div className="grid gap-px bg-slate-200 md:grid-cols-4">
              <div className="bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Visible Records</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{items.length}</p>
              </div>
              <div className="bg-red-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-red-700">High Priority</p>
                <p className="mt-2 text-3xl font-black text-red-700">{counts.red}</p>
              </div>
              <div className="bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Medium Priority</p>
                <p className="mt-2 text-3xl font-black text-amber-700">{counts.yellow}</p>
              </div>
              <div className="bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Low Priority</p>
                <p className="mt-2 text-3xl font-black text-emerald-700">{counts.green}</p>
              </div>
            </div>

            <div className="p-4">
              <SearchBar value={search} onChange={setSearch} placeholder="Search container number" />
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
