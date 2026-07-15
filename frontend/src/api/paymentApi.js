import axiosInstance from "./axiosInstance";

// Helper to map DB keys
const mapKeys = (item) => {
  if (!item) return null;
  const mapped = { ...item };
  if (mapped._id) {
    mapped.id = mapped._id.toString();
  } else if (mapped.id) {
    mapped._id = mapped.id;
  }
  if (mapped.container_id) {
    mapped.container = mapped.container_id;
  }
  return mapped;
};

export const createPayment = async (containerId, payload) => {
  const response = await axiosInstance.post(`/payments/${containerId}`, payload);
  const resData = response.data.data || response.data;
  return { data: mapKeys(resData) };
};

export const getPayment = async (containerId) => {
  const response = await axiosInstance.get(`/payments/${containerId}`);
  const resData = response.data.data || response.data;
  return { data: mapKeys(resData) };
};

export const updatePayment = async (id, payload) => {
  const response = await axiosInstance.put(`/payments/${id}`, payload);
  const resData = response.data.data || response.data;
  return { data: mapKeys(resData) };
};
