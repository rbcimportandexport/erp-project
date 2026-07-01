import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../common/Button";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const roleLabel = {
    masterAdmin: "Master Admin",
    admin: "Admin",
    user: "User",
  }[user?.role] || "User";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
      <Button variant="ghost" className="h-9 w-9 px-0 md:hidden" onClick={onMenuClick} aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
      <div>
        <p className="text-sm font-semibold text-slate-900">{user?.name || "ERP User"}</p>
        <p className="text-xs text-slate-500">{roleLabel}</p>
      </div>
      <Button variant="secondary" onClick={logout}><LogOut className="h-4 w-4" />Logout</Button>
    </header>
  );
};

export default Navbar;
