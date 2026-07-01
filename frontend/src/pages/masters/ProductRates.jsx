import { productRateApi } from "../../api/productApi";
import ResourcePage from "../ResourcePage";

const ProductRates = () => <ResourcePage title="Product Rates" api={productRateApi} fields={[
  { name: "product", label: "Product ID", required: true },
  { name: "importer", label: "Importer ID", required: true },
  { name: "buyRate", label: "Buy Rate", type: "number" },
  { name: "sellRate", label: "Sell Rate", type: "number" },
  { name: "currency", label: "Currency" },
  { name: "effectiveDate", label: "Effective Date", type: "date" },
]} columns={[{ header: "Product", accessorKey: "product.name" }, { header: "Importer", accessorKey: "importer.name" }, { header: "Buy", accessorKey: "buyRate" }, { header: "Sell", accessorKey: "sellRate" }]} />;

export default ProductRates;
