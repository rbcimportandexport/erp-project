import { productRateApi } from "../../api/productApi";
import ResourcePage from "../ResourcePage";
import { EditCellButton, MasterHeader, masterRowClass } from "./masterPageUi";

const ProductRates = () => (
  <ResourcePage
    title="Product Rates"
    api={productRateApi}
    tableVariant="cards"
    getRowClassName={masterRowClass}
    renderHeader={(props) => (
      <MasterHeader {...props} addLabel="Add Product Rate" searchPlaceholder="Search product rate" />
    )}
    fields={[
      { name: "product", label: "Product ID", required: true },
      { name: "importer", label: "Importer ID", required: true },
      { name: "buyRate", label: "Buy Rate", type: "number" },
      { name: "sellRate", label: "Sell Rate", type: "number" },
      { name: "currency", label: "Currency" },
      { name: "effectiveDate", label: "Effective Date", type: "date" },
    ]}
    columns={[
      {
        header: "Product",
        accessorKey: "product.name",
        cell: ({ row, table }) => <EditCellButton row={row} table={table}>{row.original.product?.name || row.original.product || "-"}</EditCellButton>,
      },
      { header: "Importer", accessorKey: "importer.name", cell: ({ row }) => row.original.importer?.name || row.original.importer || "-" },
      { header: "Buy", accessorKey: "buyRate", cell: ({ row }) => row.original.buyRate ?? row.original.buy_rate ?? "-" },
      { header: "Sell", accessorKey: "sellRate", cell: ({ row }) => row.original.sellRate ?? row.original.sell_rate ?? "-" },
    ]}
  />
);

export default ProductRates;
