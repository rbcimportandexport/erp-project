import { createCrudApi } from "./crudApi";

export const productApi = createCrudApi("/products");
export const productRateApi = createCrudApi("/products/rates");
export const invoiceTemplateApi = createCrudApi("/products/invoice-templates");
