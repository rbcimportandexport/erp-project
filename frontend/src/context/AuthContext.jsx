import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { login as loginRequest, me } from "../api/authApi";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("token")));

  const refreshUser = useCallback(async () => {
    try {
      const response = await me();
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("token")) refreshUser();
  }, [refreshUser]);

  const login = async (payload) => {
    const response = await loginRequest(payload);
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    setUser(response.data.user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, isAuthenticated: Boolean(user && localStorage.getItem("token")), login, logout, refreshUser }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
