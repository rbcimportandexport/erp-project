import axiosInstance from "./axiosInstance";

// Helper to map DB keys
const mapKeys = (item) => {
  if (!item || typeof item !== "object") return item;
  if (Array.isArray(item)) return item.map(mapKeys);

  const mapped = { ...item };
  if (mapped._id) {
    mapped.id = mapped._id.toString();
  } else if (mapped.id) {
    mapped._id = mapped.id;
  }

  // Ensure compatibility with container reference field
  if (mapped.container_id) mapped.container = mapped.container_id;

  for (const key in mapped) {
    if (typeof mapped[key] === "object") {
      mapped[key] = mapKeys(mapped[key]);
    }
  }

  return mapped;
};

export const getStats = async () => {
  const response = await axiosInstance.get("/dashboard/stats");
  const resData = response.data.data || response.data;
  return { data: mapKeys(resData) };
};

export const getUpcomingEta = async () => {
  const response = await axiosInstance.get("/dashboard/upcoming-eta");
  const resData = response.data.data || response.data;
  return { data: mapKeys(resData) };
};

export const getEtaPriorities = async () => {
  // Use containers endpoint with order logic since eta-priorities list is containers sorted by eta
  const response = await axiosInstance.get("/containers", {
    params: {
      limit: 1000,
      sort: "etaDate"
    }
  });
  const resData = response.data.data || response.data;
  return { data: mapKeys(resData.items || []) };
};

export const getPendingBoe = async () => {
  const response = await axiosInstance.get("/dashboard/pending-boe");
  const resData = response.data.data || response.data;
  return { data: mapKeys(resData) };
};

export const getPendingLinePayment = async () => {
  const response = await axiosInstance.get("/dashboard/pending-line-payment");
  const resData = response.data.data || response.data;
  return { data: mapKeys(resData) };
};
