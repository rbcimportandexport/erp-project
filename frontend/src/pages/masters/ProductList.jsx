import { useEffect, useState } from "react";
import { productApi } from "../../api/productApi";
import hsnApi from "../../api/hsnApi";
import ResourcePage from "../ResourcePage";

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
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "hsnCode", label: "HSN Code", type: "select", options: hsnCodes, required: true },
        { name: "unit", label: "Unit", required: true },
        { name: "description", label: "Description" },
        { name: "unitPrice", label: "Unit Price", type: "number" },
        { name: "mark", label: "Mark" },
      ]}
      columns={[
        { header: "Name", accessorKey: "name" },
        { header: "Unit", accessorKey: "unit" },
        { header: "Unit Price", accessorKey: "unitPrice" },
        { header: "Mark", accessorKey: "mark" },
        { header: "Description", accessorKey: "description" }
      ]}
    />
  );
};

export default ProductList;
