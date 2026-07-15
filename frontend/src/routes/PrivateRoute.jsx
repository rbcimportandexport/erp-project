import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "../components/common/Loader";
import { useAuth } from "../hooks/useAuth";

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  const hasLocalSession = Boolean(localStorage.getItem("token") && localStorage.getItem("user"));

  if (loading && !hasLocalSession) return <Loader />;
  if (!isAuthenticated && !loading) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
};

export default PrivateRoute;
