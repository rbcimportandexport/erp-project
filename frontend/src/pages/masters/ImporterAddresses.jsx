import { useEffect, useState } from "react";
import { importerAddressApi } from "../../api/addressApi";
import importerApi from "../../api/importerApi";
import ResourcePage from "../ResourcePage";
import { EditCellButton, MasterHeader, masterRowClass } from "./masterPageUi";

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
      tableVariant="cards"
      getRowClassName={masterRowClass}
      renderHeader={(props) => (
        <MasterHeader
          {...props}
          addLabel="Add Importer Address"
          description="Importer name par click karo, address edit direct open hoga."
          searchPlaceholder="Search importer address"
        />
      )}
      fields={[
        { name: "importer", label: "Importer", type: "select", options: importers, required: true },
        { name: "address_line1", label: "Address", required: true },
        { name: "is_default", label: "Default", type: "select", options: [
          { value: "false", label: "No" },
          { value: "true", label: "Yes" },
        ] },
      ]}
      columns={[
        {
          header: "Importer",
          accessorFn: (row) => row.importer?.name || row.importer || "",
          cell: ({ row, table }) => <EditCellButton row={row} table={table}>{row.original.importer?.name || row.original.importer}</EditCellButton>,
        },
        { header: "Address", accessorFn: (row) => row.addressLine1 || row.address_line1 || "" },
        { header: "Default", accessorFn: (row) => (row.isDefault ?? row.is_default ? "Yes" : "No") },
      ]}
    />
  );
};

export default ImporterAddresses;
