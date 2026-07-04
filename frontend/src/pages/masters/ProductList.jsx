import { useEffect, useState } from "react";
import { productApi } from "../../api/productApi";
import hsnApi from "../../api/hsnApi";
import ResourcePage from "../ResourcePage";
import { EditCellButton, MasterHeader, masterRowClass } from "./masterPageUi";

const ProductList = () => {
  const [hsnCodes, setHsnCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const hsnRes = await hsnApi.list({ limit: 1000 });
        const sortedHsn = (hsnRes.data?.items || []).sort((a, b) =>
          (a.code || "").localeCompare(b.code || "", undefined, { sensitivity: "base" })
        ).map((item) => ({
          value: item._id,
          label: item.code,
        }));
        setHsnCodes(sortedHsn);
      } catch (err) {
        console.error("Error loading product HSN options:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <span className="text-sm text-slate-500 animate-pulse">Loading HSN codes...</span>
      </div>
    );
  }

  return (
    <ResourcePage
      title="Products"
      api={productApi}
      tableVariant="cards"
      getRowClassName={masterRowClass}
      renderHeader={(props) => (
        <MasterHeader {...props} addLabel="Add Product" searchPlaceholder="Search product name" />
      )}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "hsnCode", label: "HSN Code", type: "select", options: hsnCodes, required: true },
        { name: "unit", label: "Unit", required: true },
        { name: "description", label: "Description" },
        { name: "unitPrice", label: "Unit Price", type: "number" },
        { name: "mark", label: "Mark" },
      ]}
      columns={[
        {
          header: "Product",
          accessorKey: "name",
          cell: ({ row, table }) => <EditCellButton row={row} table={table}>{row.original.name}</EditCellButton>,
        },
        { header: "Unit", accessorKey: "unit", cell: ({ row }) => row.original.unit || "-" },
        { header: "Unit Price", accessorKey: "unitPrice", cell: ({ row }) => row.original.unitPrice ?? row.original.unit_price ?? "-" },
        { header: "Mark", accessorKey: "mark", cell: ({ row }) => row.original.mark || "-" },
        { header: "Description", accessorKey: "description", cell: ({ row }) => row.original.description || "-" },
      ]}
    />
  );
};

export default ProductList;
