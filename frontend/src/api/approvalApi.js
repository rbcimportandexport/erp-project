import axiosInstance from "./axiosInstance";

const approvalApi = {
  list: async (params) => {
    const response = await axiosInstance.get("/approval-requests", { params });
    const resData = response.data.data || response.data;
    return {
      data: {
        items: resData.items || [],
        total: resData.total || 0,
        page: resData.page || 1,
        pages: resData.pages || 1,
      },
    };
  },

  approve: async (id) => {
    const response = await axiosInstance.post(`/approval-requests/${id}/approve`);
    return response.data;
  },

  reject: async (id, comments) => {
    const response = await axiosInstance.post(`/approval-requests/${id}/reject`, { comments });
    return response.data;
  },
};

export default approvalApi;
