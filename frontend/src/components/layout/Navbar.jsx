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
      <Button 
        variant="secondary" 
        className="h-10 w-10 p-0 flex items-center justify-center rounded-xl md:hidden hover:bg-slate-50 active:scale-95 transition-all" 
        onClick={onMenuClick} 
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-slate-800 shrink-0" />
      </Button>
      <div>
        <p className="text-base font-black text-slate-950 capitalize tracking-tight">{user?.name || "ERP User"}</p>
        <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mt-0.5">{roleLabel}</p>
      </div>
      <Button variant="secondary" onClick={logout}><LogOut className="h-4 w-4" />Logout</Button>
    </header>
  );
};

export default Navbar;
