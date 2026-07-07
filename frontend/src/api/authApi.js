import axiosInstance from "./axiosInstance";

const mapBackendUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    id: user._id || user.id,
  };
};

export const login = async (payload) => {
  const response = await axiosInstance.post("/auth/login", {
    email: payload.email,
    password: payload.password,
  });
  
  const { data } = response.data;
  return {
    data: {
      token: data.token,
      user: mapBackendUser(data.user),
    },
  };
};

export const register = async (payload) => {
  const response = await axiosInstance.post("/auth/register", {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: payload.role || "user",
  });

  const { data } = response.data;
  return {
    data: {
      token: data.token || "",
      user: mapBackendUser(data.user),
      needsEmailConfirmation: false,
    },
  };
};

export const resendConfirmationEmail = async (email) => {
  return { data: { success: true } };
};

export const me = async () => {
  const response = await axiosInstance.get("/auth/me");
  const resData = response.data.data || response.data;
  return { data: mapBackendUser(resData) };
};

export const changePassword = async (payload) => {
  const response = await axiosInstance.put("/auth/change-password", {
    currentPassword: payload.currentPassword,
    newPassword: payload.newPassword,
  });
  return { data: response.data.data || response.data };
};
