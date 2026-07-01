import { createCrudApi } from "./crudApi";

export const importerAddressApi = createCrudApi("/addresses/importers");
export const exporterAddressApi = createCrudApi("/addresses/exporters");
