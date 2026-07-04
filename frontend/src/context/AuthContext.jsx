import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { login as loginRequest, me } from "../api/authApi";
import { supabase } from "../supabaseClient";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await me();
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) localStorage.setItem("token", data.session.access_token);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (data.session?.access_token) {
        localStorage.setItem("token", data.session.access_token);
        await refreshUser();
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setLoading(false);
      }
    };

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) {
        localStorage.setItem("token", session.access_token);
        refreshUser();
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [refreshUser]);

  const login = async (payload) => {
    const response = await loginRequest(payload);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    setUser(response.data.user);
    return response;
  };

  const logout = () => {
    supabase.auth.signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, isAuthenticated: Boolean(user && localStorage.getItem("token")), login, logout, refreshUser }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
