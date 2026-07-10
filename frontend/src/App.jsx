import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AlertProvider } from "./context/AlertContext";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import InstallAppPrompt from "./components/common/InstallAppPrompt";

const App = () => (
  <BrowserRouter>
    <AlertProvider>
      <AuthProvider>
        <AppRoutes />
        <InstallAppPrompt />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </AlertProvider>
  </BrowserRouter>
);

export default App;
