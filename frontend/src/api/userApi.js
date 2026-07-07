import { createClient } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a temp client that does not persist session so signing up a user doesn't log the admin out!
const getTempSupabase = () => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

const mapProfile = (profile) => ({
  _id: profile.id,
  id: profile.id,
  name: profile.name || profile.email?.split("@")[0] || "User",
  email: profile.email || "",
  role: profile.role || "user",
  isActive: profile.is_active ?? true,
  createdAt: profile.created_at,
  updatedAt: profile.updated_at,
});

const userApi = {
  list: async (params) => {
    const page = Math.max(Number(params?.page) || 1, 1);
    const limit = Math.min(Math.max(Number(params?.limit) || 10, 1), 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const search = String(params?.search || "").trim();

    let query = supabase
      .from("user_profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    // Apply role-based filtering based on the logged-in user
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      const role = storedUser?.role || "user";
      if (role === "admin") {
        // admin can only see 'user' role accounts
        query = query.eq("role", "user");
      } else if (role === "masterAdmin") {
        // masterAdmin can see all roles
        query = query.in("role", ["admin", "user", "masterAdmin"]);
      } else {
        // Regular user or other roles cannot view users list
        query = query.eq("role", "none");
      }
    } catch (e) {
      console.error("Error parsing user role for user list query:", e);
    }

    if (search) {
      const safeSearch = search.replace(/[%_]/g, "");
      query = query.or(`name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count || 0;
    return {
      data: {
        items: (data || []).map(mapProfile),
        total,
        page,
        pages: Math.max(Math.ceil(total / limit), 1),
      },
    };
  },

  create: async (payload) => {
    let profileId = "";

    // 1. Sign up the user in Supabase first (if email & password are provided)
    if (payload.email && payload.password) {
      try {
        const tempSupabase = getTempSupabase();
        const { data: signUpData, error: signUpError } = await tempSupabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            data: {
              name: payload.name,
              role: payload.role || "user",
            },
          },
        });
        if (signUpError) {
          // If already registered, ignore and proceed so it syncs or fails gracefully on backend
          if (!signUpError.message.includes("already registered")) {
            throw signUpError;
          }
        }

        profileId = signUpData?.user?.id || "";
      } catch (err) {
        console.error("Supabase user creation failed:", err);
      }
    }

    const profilePayload = {
      id: profileId || crypto.randomUUID(),
      name: payload.name,
      email: String(payload.email || "").toLowerCase(),
      role: payload.role || "user",
      is_active: payload.isActive ?? true,
    };

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(profilePayload, { onConflict: "email" })
      .select()
      .single();

    if (error) throw error;
    return { data: mapProfile(data) };
  },

  update: async (id, payload) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        name: payload.name,
        email: String(payload.email || "").toLowerCase(),
        role: payload.role || "user",
        is_active: payload.isActive ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data: mapProfile(data) };
  },

  remove: async (id) => {
    const { error } = await supabase.from("user_profiles").delete().eq("id", id);
    if (error) throw error;
    return { data: { id } };
  },
};

export default userApi;
