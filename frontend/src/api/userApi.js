import axiosInstance from "./axiosInstance";

const mapProfile = (profile) => {
  if (!profile) return null;
  return {
    ...profile,
    _id: profile._id || profile.id,
    id: profile._id || profile.id,
    isActive: profile.isActive ?? true,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
};

const userApi = {
  list: async (params) => {
    const response = await axiosInstance.get("/users", { params });
    const resData = response.data.data || response.data;
    return {
      data: {
        items: (resData.items || []).map(mapProfile),
        total: resData.total || 0,
        page: resData.page || 1,
        pages: resData.pages || 1,
      },
    };
  },

  create: async (payload) => {
    const response = await axiosInstance.post("/users", {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role || "user",
      isActive: payload.isActive ?? true,
    });
    const resData = response.data.data || response.data;
    return { data: mapProfile(resData) };
  },

  update: async (id, payload) => {
    const response = await axiosInstance.put(`/users/${id}`, {
      name: payload.name,
      email: payload.email,
      role: payload.role || "user",
      isActive: payload.isActive ?? true,
    });
    const resData = response.data.data || response.data;
    return { data: mapProfile(resData) };
  },

  remove: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    const resData = response.data.data || response.data;
    return { data: { id: id } };
  },
};

export default userApi;
