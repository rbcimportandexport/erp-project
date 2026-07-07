import { Link, NavLink } from "react-router-dom";
import { Activity, Boxes, ChevronLeft, ChevronRight, FileText, Gauge, Landmark, Package, Receipt, Ship, Truck, UserCog, Users, Files, ClipboardList } from "lucide-react";
import Button from "../common/Button";
import { useAuth } from "../../hooks/useAuth";

const items = [
  { to: "/", label: "Dashboard", icon: Gauge, end: true },
  { to: "/containers", label: "Containers", icon: Boxes },
  { to: "/documents", label: "Documents", icon: Files, end: true },
  { to: "/documents/invoice-maker", label: "Packing List Form", icon: ClipboardList },
  { to: "/documents/quotation-maker", label: "Quotation Form", icon: ClipboardList },
  { to: "/payments", label: "Payments", icon: Receipt },
];

const masterItems = [
  { to: "/masters/importers", label: "Importers", icon: Users },
  { to: "/masters/importer-addresses", label: "Importer Address", icon: Users },
  { to: "/masters/exporters", label: "Exporters", icon: Ship },
  { to: "/masters/exporter-addresses", label: "Exporter Address", icon: Ship },
  { to: "/masters/india-ports", label: "India Ports", icon: Landmark },
  { to: "/masters/china-ports", label: "China Ports", icon: Landmark },
  { to: "/masters/hsn", label: "HSN Codes", icon: FileText },
  { to: "/masters/products", label: "Products", icon: Package },
];

const adminItems = [
  { to: "/users", label: "Users", icon: UserCog },
  { to: "/reports", label: "Reports", icon: Activity },
  { to: "/activity-logs", label: "Activity", icon: Truck },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { user } = useAuth();
  const userRole = user?.role || "user";

  const visibleAdminItems = adminItems.filter((item) => {
    if (userRole === "masterAdmin") return true;
    if (userRole === "admin") {
      return item.to === "/users";
    }
    return false;
  });

  return (
    <aside className={`${collapsed ? "w-20" : "w-64"} sticky top-0 h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] hidden shrink-0 bg-white border-r border-slate-200 text-slate-750 transition-all md:block`}>
      <div className="flex h-16 items-center justify-between px-4">
        <Link to="/" className="min-w-0 font-black text-2xl tracking-wider text-slate-950 uppercase">{collapsed ? "RBC" : "RBC ERP"}</Link>
        <Button variant="ghost" className="h-8 w-8 px-0 text-slate-500 hover:bg-slate-100 hover:text-slate-800" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav className="space-y-1 px-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
        {!collapsed && <div className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Masters</div>}
        {masterItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
        {visibleAdminItems.length > 0 && !collapsed && (
          <div className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Admin</div>
        )}
        {visibleAdminItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
