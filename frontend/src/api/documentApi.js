import axiosInstance from "./axiosInstance";

// Helper to map DB keys
const mapDoc = (doc) => {
  if (!doc) return null;
  return {
    ...doc,
    _id: doc._id || doc.id,
    id: doc._id || doc.id,
    container: doc.container?._id || doc.container || doc.container_id,
    containerNo: doc.container?.containerNo || doc.containerNo || "-",
    docType: doc.docType || doc.doc_type,
    fileName: doc.fileName || doc.file_name,
    filePath: doc.filePath || doc.file_path,
  };
};

export const uploadDocument = async (containerId, formData) => {
  const response = await axiosInstance.post(`/documents/upload/${containerId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const resData = response.data.data || response.data;
  return { data: mapDoc(resData) };
};

export const getDocuments = async (containerId) => {
  const response = await axiosInstance.get(`/documents/${containerId}`);
  const resData = response.data.data || response.data;
  return {
    data: (resData || []).map(mapDoc),
  };
};

export const deleteDocument = async (id) => {
  const response = await axiosInstance.delete(`/documents/${id}`);
  const resData = response.data.data || response.data;
  return { data: mapDoc(resData) };
};

export const getAllDocuments = async () => {
  const response = await axiosInstance.get("/documents");
  const resData = response.data.data || response.data;
  return {
    data: (resData || []).map(mapDoc),
  };
};

export const parseInvoicePackingList = (formData) =>
  axiosInstance
    .post("/documents/parse-invoice-packing-list", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
