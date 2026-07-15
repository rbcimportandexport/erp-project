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
  { to: "/analytics", label: "Analytics", icon: Activity },
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
  { to: "/approvals", label: "Approvals", icon: ClipboardList },
];

const Sidebar = ({ collapsed, onToggle, onCollapse, mobileOpen, onMobileClose }) => {
  const { user } = useAuth();
  const handleItemClick = () => {
    onMobileClose();
    if (window.innerWidth >= 768) {
      onCollapse(true);
    }
  };
  const userRole = user?.role || "user";

  const visibleAdminItems = adminItems.filter((item) => {
    if (userRole === "masterAdmin") return true;
    if (userRole === "admin") {
      return item.to === "/users";
    }
    return false;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar aside panel */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 flex h-full flex-col bg-white border-r border-slate-200 text-slate-700 transition-all duration-300 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shrink-0
          ${mobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
          md:sticky md:top-0 md:h-screen md:translate-x-0 md:flex
          ${collapsed ? "md:w-0 md:overflow-hidden md:border-r-0" : "md:w-64"}
        `}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100 shrink-0">
          <Link 
            to="/" 
            onClick={onMobileClose}
            className="min-w-0 font-bold text-2xl tracking-wider text-slate-900 uppercase"
          >
            {collapsed ? <span className="text-brand-600 font-bold">R</span> : <>RBC <span className="text-brand-600 font-extrabold">ERP</span></>}
          </Link>
          <Button 
            variant="ghost" 
            className="h-8 w-8 px-0 text-slate-400 hover:bg-slate-50 hover:text-slate-800 hidden md:flex" 
            onClick={onToggle} 
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={handleItemClick}
                className={({ isActive }) => `flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all ${isActive ? "bg-brand-50 text-brand-600 shadow-sm border-l-2 border-brand-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={`truncate ${collapsed ? "md:hidden" : ""}`}>{item.label}</span>
              </NavLink>
            );
          })}
          {(!collapsed || mobileOpen) && <div className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Masters</div>}
          {masterItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleItemClick}
                className={({ isActive }) => `flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all ${isActive ? "bg-brand-50 text-brand-600 shadow-sm border-l-2 border-brand-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={`truncate ${collapsed ? "md:hidden" : ""}`}>{item.label}</span>
              </NavLink>
            );
          })}
          {visibleAdminItems.length > 0 && (!collapsed || mobileOpen) && (
            <div className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Admin</div>
          )}
          {visibleAdminItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleItemClick}
                className={({ isActive }) => `flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all ${isActive ? "bg-brand-50 text-brand-600 shadow-sm border-l-2 border-brand-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={`truncate ${collapsed ? "md:hidden" : ""}`}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
