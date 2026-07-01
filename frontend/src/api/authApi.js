import { supabase } from "../supabaseClient";

export const login = async (payload) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });
  if (error) throw error;

  const user = {
    id: data.user.id,
    _id: data.user.id,
    email: data.user.email,
    name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
    role: data.user.user_metadata?.role || "admin",
  };

  return {
    data: {
      token: data.session.access_token,
      user,
    },
  };
};

export const register = async (payload) => {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        name: payload.name,
        role: payload.role || "admin",
      },
    },
  });
  if (error) throw error;

  const user = {
    id: data.user?.id,
    _id: data.user?.id,
    email: data.user?.email,
    name: data.user?.user_metadata?.name || data.user?.email?.split("@")[0] || "User",
    role: data.user?.user_metadata?.role || "admin",
  };

  return {
    data: {
      token: data.session?.access_token || "",
      user,
    },
  };
};

export const me = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;

  const mappedUser = {
    id: user.id,
    _id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
    role: user.user_metadata?.role || "admin",
  };

  return {
    data: mappedUser,
  };
};

export const changePassword = async (payload) => {
  const { data, error } = await supabase.auth.updateUser({
    password: payload.newPassword,
  });
  if (error) throw error;
  return { data };
};
