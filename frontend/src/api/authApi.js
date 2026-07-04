import { supabase } from "../supabaseClient";

const mapSupabaseUser = (user) => ({
  id: user.id,
  _id: user.id,
  email: user.email,
  name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
  role: user.user_metadata?.role || "user",
});

export const login = async (payload) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });
  if (error) throw error;

  if (!data.session?.access_token || !data.user) {
    throw new Error("Login session nahi bana. Supabase email confirmation check karo.");
  }

  return {
    data: {
      token: data.session.access_token,
      user: mapSupabaseUser(data.user),
    },
  };
};

const getEmailRedirectTo = () => {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/login`;
};

export const register = async (payload) => {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      emailRedirectTo: getEmailRedirectTo(),
      data: {
        name: payload.name,
        role: payload.role || "user",
      },
    },
  });
  if (error) throw error;

  const user = data.user ? mapSupabaseUser(data.user) : null;

  return {
    data: {
      token: data.session?.access_token || "",
      user,
      needsEmailConfirmation: Boolean(data.user && !data.session),
    },
  };
};

export const resendConfirmationEmail = async (email) => {
  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: getEmailRedirectTo(),
    },
  });

  if (error) throw error;
  return { data };
};

export const me = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("No active session");

  return {
    data: mapSupabaseUser(user),
  };
};

export const changePassword = async (payload) => {
  const { data, error } = await supabase.auth.updateUser({
    password: payload.newPassword,
  });
  if (error) throw error;
  return { data };
};
