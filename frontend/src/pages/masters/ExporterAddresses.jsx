import { useEffect, useState } from "react";
import { exporterAddressApi } from "../../api/addressApi";
import exporterApi from "../../api/exporterApi";
import ResourcePage from "../ResourcePage";

const ExporterAddresses = () => {
  const [exporters, setExporters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const expRes = await exporterApi.list({ limit: 1000 });
        const sortedExporters = (expRes.data?.items || []).sort((a, b) => 
          (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
        ).map((item) => ({
          value: item._id,
          label: item.name,
        }));
        setExporters(sortedExporters);
      } catch (err) {
        console.error("Error loading exporters list for addresses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <span className="text-sm text-slate-500 animate-pulse">Loading exporters...</span>
      </div>
    );
  }

  return (
    <ResourcePage
      title="Exporter Addresses"
      api={exporterAddressApi}
      fields={[
        { name: "exporter", label: "Exporter", type: "select", options: exporters, required: true },
        { name: "addressLine1", label: "Address", required: true },
      ]}
      columns={[
        { header: "Exporter", accessorFn: (row) => row.exporter?.name || row.exporter || "" },
        { header: "Address", accessorKey: "addressLine1" },
      ]}
    />
  );
};

export default ExporterAddresses;
