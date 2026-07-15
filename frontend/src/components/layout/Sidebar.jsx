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
    if (userRole === "admin") return item.to === "/users";
    return false;
  });

  const linkBase = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#c5d8ec",
    textDecoration: "none",
    borderLeft: "3px solid transparent",
    cursor: "pointer",
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
          className="md:hidden"
        />
      )}

      {/* ── SIDEBAR ── using sticky (NOT fixed) so flex layout works */}
      <aside
        style={{
          backgroundColor: "#0d2137",
          borderRight: "2px solid #071524",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          overflowX: "hidden",
          flexShrink: 0,
          height: "100vh",
          /* scrollbar hidden */
          scrollbarWidth: "none",
        }}
        className={[
          /* mobile: fixed slide-in */
          "fixed inset-y-0 left-0 z-40",
          mobileOpen ? "translate-x-0 w-[220px]" : "-translate-x-full w-[220px]",
          /* desktop: sticky in flex row */
          collapsed
            ? "md:static md:translate-x-0 md:w-0 md:min-w-0 md:overflow-hidden md:border-r-0"
            : "md:static md:translate-x-0 md:w-[220px] md:min-w-[220px]",
          "transition-all duration-300",
        ].join(" ")}
      >
        {/* ── Brand / Logo ── */}
        <div
          style={{
            backgroundColor: "#071524",
            borderBottom: "2px solid #030e18",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "44px",
            flexShrink: 0,
          }}
        >
          <Link
            to="/"
            onClick={onMobileClose}
            style={{
              fontWeight: "800",
              fontSize: "14px",
              color: "#ffffff",
              textDecoration: "none",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            RBC <span style={{ color: "#f0b429" }}>ERP</span>
          </Link>

          <button
            onClick={onToggle}
            aria-label="Toggle sidebar"
            className="hidden md:flex"
            style={{
              background: "transparent",
              border: "1px solid #1a3a5c",
              color: "#c5d8ec",
              padding: "2px 5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav style={{ flex: 1, paddingTop: "4px", paddingBottom: "16px" }}>

          {/* Main items */}
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={handleItemClick}
                style={({ isActive }) => ({
                  ...linkBase,
                  backgroundColor: isActive ? "#f0b429" : "transparent",
                  color: isActive ? "#0d1117" : "#c5d8ec",
                  borderLeft: isActive ? "3px solid #c9900a" : "3px solid transparent",
                  fontWeight: isActive ? "700" : "600",
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.className.includes("active")) {
                    e.currentTarget.style.backgroundColor = "#1a3a5c";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderLeft = "3px solid #4da3ff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.getAttribute("aria-current")) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#c5d8ec";
                    e.currentTarget.style.borderLeft = "3px solid transparent";
                  }
                }}
              >
                <Icon size={13} style={{ flexShrink: 0 }} />
                <span style={{ overflow: "hidden", whiteSpace: "nowrap" }}>{item.label}</span>
              </NavLink>
            );
          })}

          {/* MASTERS label */}
          <div style={{
            color: "#6b8eac", fontSize: "10px", fontWeight: "700",
            padding: "10px 12px 4px", textTransform: "uppercase",
            letterSpacing: "0.07em", borderTop: "1px solid #1a3a5c", marginTop: "6px",
          }}>
            Masters
          </div>

          {masterItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleItemClick}
                style={({ isActive }) => ({
                  ...linkBase,
                  backgroundColor: isActive ? "#f0b429" : "transparent",
                  color: isActive ? "#0d1117" : "#c5d8ec",
                  borderLeft: isActive ? "3px solid #c9900a" : "3px solid transparent",
                  fontWeight: isActive ? "700" : "600",
                })}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#1a3a5c";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.getAttribute("aria-current")) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#c5d8ec";
                  }
                }}
              >
                <Icon size={13} style={{ flexShrink: 0 }} />
                <span style={{ overflow: "hidden", whiteSpace: "nowrap" }}>{item.label}</span>
              </NavLink>
            );
          })}

          {/* ADMIN label + items */}
          {visibleAdminItems.length > 0 && (
            <>
              <div style={{
                color: "#6b8eac", fontSize: "10px", fontWeight: "700",
                padding: "10px 12px 4px", textTransform: "uppercase",
                letterSpacing: "0.07em", borderTop: "1px solid #1a3a5c", marginTop: "6px",
              }}>
                Admin
              </div>
              {visibleAdminItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={handleItemClick}
                    style={({ isActive }) => ({
                      ...linkBase,
                      backgroundColor: isActive ? "#f0b429" : "transparent",
                      color: isActive ? "#0d1117" : "#c5d8ec",
                      borderLeft: isActive ? "3px solid #c9900a" : "3px solid transparent",
                      fontWeight: isActive ? "700" : "600",
                    })}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#1a3a5c";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.getAttribute("aria-current")) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#c5d8ec";
                      }
                    }}
                  >
                    <Icon size={13} style={{ flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", whiteSpace: "nowrap" }}>{item.label}</span>
                  </NavLink>
                );
              })}
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
