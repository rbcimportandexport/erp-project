import { Link, NavLink } from "react-router-dom";

import {
  Activity, Boxes, ChevronLeft, ChevronRight, FileText, Gauge,
  Landmark, Package, Receipt, Ship, Truck, UserCog, Users,
  Files, ClipboardList,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";

const items = [
  { to: "/", label: "Dashboard", icon: Gauge, end: true },
  { to: "/containers", label: "Containers", icon: Boxes },
  { to: "/documents", label: "Documents", icon: Files, end: true },

  { to: "/documents/invoice-maker", label: "Packing List", icon: ClipboardList },
  { to: "/documents/quotation-maker", label: "Quotation", icon: ClipboardList },

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
  const userRole = user?.role || "user";

  const handleClick = () => {
    onMobileClose();
    if (window.innerWidth >= 768) onCollapse(true);
  };

  const visibleAdminItems = adminItems.filter((item) => {
    if (userRole === "masterAdmin") return true;
    if (userRole === "admin") return item.to === "/users";
    return false;
  });

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    return (
      <NavLink
        to={item.to}
        end={item.end}
        onClick={handleClick}
        className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
      >
        <Icon size={14} />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{ position:"fixed", inset:0, zIndex:39, background:"rgba(15,23,42,0.5)" }}
          className="md:hidden"
        />
      )}

      <aside
        className={[
          "sidebar",
          collapsed ? "collapsed" : "",
          "fixed inset-y-0 left-0 z-40",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <Link to="/" onClick={onMobileClose} style={{ display:"flex", alignItems:"center", gap:"8px", textDecoration:"none", flex:1 }}>
            <span className="sidebar-logo-text">RBC</span>
            <span className="sidebar-logo-badge">ERP</span>
          </Link>
          <button
            onClick={onToggle}
            className="hidden md:flex hover:text-white transition-colors"
            style={{ background:"transparent", border:"none", color:"rgba(255,255,255,0.5)", cursor:"pointer", padding:"6px", display:"flex", alignItems:"center" }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, paddingTop:"8px", paddingBottom:"16px" }}>
          {items.map(item => <NavItem key={item.to} item={item} />)}

          <div className="sidebar-section-label">Masters</div>
          {masterItems.map(item => <NavItem key={item.to} item={item} />)}

          {visibleAdminItems.length > 0 && (
            <>
              <div className="sidebar-section-label">Admin</div>
              {visibleAdminItems.map(item => <NavItem key={item.to} item={item} />)}
            </>
          )}

        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
