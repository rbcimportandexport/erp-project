import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import containerApi from "../../api/containerApi";
import importerApi from "../../api/importerApi";
import exporterApi from "../../api/exporterApi";
import hsnApi from "../../api/hsnApi";
import StatusBadge from "../../components/common/StatusBadge";
import ResourcePage from "../ResourcePage";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "inTransit", label: "In Transit" },
  { value: "arrived", label: "Arrived" },
  { value: "cleared", label: "Cleared" },
  { value: "done", label: "Done" },
];

const ContainerList = () => {
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
      fields={[
        { name: "containerNo", label: "Container No", required: true },
        { name: "importer", label: "Importer", type: "select", options: importers, required: true },
        { name: "exporter", label: "Exporter", type: "select", options: exporters, required: true },
        { name: "hsnCode", label: "HSN Code", type: "select", options: hsnCodes },
        { name: "loadingDate", label: "Loading Date", type: "date" },
        { name: "etaDate", label: "ETA Date", type: "date" },
        { name: "unloadingDate", label: "Unloading Date", type: "date" },
        { name: "status", label: "Status", type: "select", options: statusOptions },
        { name: "remarks", label: "Remarks" },
      ]}
      columns={[
        { header: "Container", accessorKey: "containerNo", cell: ({ row }) => <Link className="font-semibold text-brand-600" to={`/containers/${row.original._id}`}>{row.original.containerNo}</Link> },
        { header: "Importer", accessorFn: (row) => row.importer?.name || "" },
        { header: "ETA", accessorKey: "etaDate", cell: ({ row }) => row.original.etaDate ? dayjs(row.original.etaDate).format("DD MMM YYYY") : "-" },
        { header: "Status", accessorKey: "status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      ]}
    />
  );
};

export default ContainerList;
