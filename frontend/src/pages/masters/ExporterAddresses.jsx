import { useEffect, useState } from "react";
import { exporterAddressApi } from "../../api/addressApi";
import exporterApi from "../../api/exporterApi";
import ResourcePage from "../ResourcePage";
import { EditCellButton, MasterHeader, masterRowClass } from "./masterPageUi";

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
      tableVariant="cards"
      getRowClassName={masterRowClass}
      renderHeader={(props) => (
        <MasterHeader
          {...props}
          addLabel="Add Exporter Address"
          description="Exporter name par click karo, address edit direct open hoga."
          searchPlaceholder="Search exporter address"
        />
      )}
      fields={[
        { name: "exporter", label: "Exporter", type: "select", options: exporters, required: true },
        { name: "address_line1", label: "Address", required: true },
      ]}
      columns={[
        {
          header: "Exporter",
          accessorFn: (row) => row.exporter?.name || row.exporter || "",
          cell: ({ row, table }) => <EditCellButton row={row} table={table}>{row.original.exporter?.name || row.original.exporter}</EditCellButton>,
        },
        { header: "Address", accessorFn: (row) => row.addressLine1 || row.address_line1 || "" },
      ]}
    />
  );
};

export default ExporterAddresses;
