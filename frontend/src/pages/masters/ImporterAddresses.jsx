import { useEffect, useState } from "react";
import { importerAddressApi } from "../../api/addressApi";
import importerApi from "../../api/importerApi";
import ResourcePage from "../ResourcePage";

const ImporterAddresses = () => {
  const [importers, setImporters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const impRes = await importerApi.list({ limit: 1000 });
        const sortedImporters = (impRes.data?.items || []).sort((a, b) => 
          (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
        ).map((item) => ({
          value: item._id,
          label: item.name,
        }));
        setImporters(sortedImporters);
      } catch (err) {
        console.error("Error loading importers list for addresses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <span className="text-sm text-slate-500 animate-pulse">Loading importers...</span>
      </div>
    );
  }

  return (
    <ResourcePage
      title="Importer Addresses"
      api={importerAddressApi}
      fields={[
        { name: "importer", label: "Importer", type: "select", options: importers, required: true },
        { name: "addressLine1", label: "Address", required: true },
      ]}
      columns={[
        { header: "Importer", accessorFn: (row) => row.importer?.name || row.importer || "" },
        { header: "Address", accessorKey: "addressLine1" },
        { header: "Default", accessorFn: (row) => (row.isDefault ? "Yes" : "No") },
      ]}
    />
  );
};

export default ImporterAddresses;
