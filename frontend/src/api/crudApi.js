import axiosInstance from "./axiosInstance";

// Helper to map DB column keys (id <-> _id)
const mapKeys = (item) => {
  if (!item || typeof item !== "object") return item;
  if (Array.isArray(item)) return item.map(mapKeys);

  const mapped = { ...item };
  if (mapped._id) {
    mapped.id = mapped._id.toString();
  } else if (mapped.id) {
    mapped._id = mapped.id;
  }

  // Fallback map snake_case to camelCase just in case
  if ("address_line1" in mapped && !("addressLine1" in mapped)) mapped.addressLine1 = mapped.address_line1;
  if ("is_default" in mapped && !("isDefault" in mapped)) mapped.isDefault = mapped.is_default;
  if ("port_name" in mapped && !("portName" in mapped)) mapped.portName = mapped.port_name;
  if ("container_no" in mapped && !("containerNo" in mapped)) mapped.containerNo = mapped.container_no;
  if ("loading_date" in mapped && !("loadingDate" in mapped)) mapped.loadingDate = mapped.loading_date;
  if ("eta_date" in mapped && !("etaDate" in mapped)) mapped.etaDate = mapped.eta_date;
  if ("unloading_date" in mapped && !("unloadingDate" in mapped)) mapped.unloadingDate = mapped.unloading_date;
  if ("shipping_line" in mapped && !("shippingLine" in mapped)) mapped.shippingLine = mapped.shipping_line;
  if ("port_of_china" in mapped && !("portOfChina" in mapped)) mapped.portOfChina = mapped.port_of_china;
  if ("bl_no" in mapped && !("blNo" in mapped)) mapped.blNo = mapped.bl_no;
  if ("document_processed" in mapped && !("documentProcessed" in mapped)) mapped.documentProcessed = mapped.document_processed;
  if ("loading_days" in mapped && !("loadingDays" in mapped)) mapped.loadingDays = mapped.loading_days;
  if ("eta_days" in mapped && !("etaDays" in mapped)) mapped.etaDays = mapped.eta_days;

  for (const key in mapped) {
    if (typeof mapped[key] === "object") {
      mapped[key] = mapKeys(mapped[key]);
    }
  }

  return mapped;
};

// Helper to map payload keys to fit MongoDB schema
const mapPayload = (payload) => {
  if (!payload || typeof payload !== "object") return payload;
  const mapped = { ...payload };

  if (mapped.id) {
    mapped._id = mapped.id;
    delete mapped.id;
  }

  // Format blank dates to null
  if (mapped.loadingDate === "") mapped.loadingDate = null;
  if (mapped.etaDate === "") mapped.etaDate = null;
  if (mapped.unloadingDate === "") mapped.unloadingDate = null;

  return mapped;
};

export const createCrudApi = (baseUrl) => {
  return {
    list: async (params = {}) => {
      const response = await axiosInstance.get(baseUrl, { params });
      const resData = response.data.data || response.data;
      return {
        data: {
          items: mapKeys(resData.items || []),
          total: resData.total || 0,
          page: resData.page || 1,
          pages: resData.pages || 1,
        },
      };
    },

    get: async (id) => {
      const response = await axiosInstance.get(`${baseUrl}/${id}`);
      const resData = response.data.data || response.data;
      return { data: mapKeys(resData) };
    },

    create: async (payload) => {
      const mapped = mapPayload(payload);
      const response = await axiosInstance.post(baseUrl, mapped);
      const resData = response.data.data || response.data;
      return { data: mapKeys(resData) };
    },

    update: async (id, payload) => {
      const mapped = mapPayload(payload);
      const response = await axiosInstance.put(`${baseUrl}/${id}`, mapped);
      const resData = response.data.data || response.data;
      return { data: mapKeys(resData) };
    },

    remove: async (id) => {
      const response = await axiosInstance.delete(`${baseUrl}/${id}`);
      const resData = response.data.data || response.data;
      return { data: mapKeys(resData) };
    },
  };
};
