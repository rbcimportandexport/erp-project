import { createContext, useMemo } from "react";
import { toast } from "react-toastify";

export const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const value = useMemo(
    () => ({
      success: (message) => toast.success(message),
      error: (message) => toast.error(message),
      info: (message) => toast.info(message),
    }),
    []
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};
