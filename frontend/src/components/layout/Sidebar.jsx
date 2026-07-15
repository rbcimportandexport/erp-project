import { Link, NavLink } from "react-router-dom";
import { Activity, Boxes, ChevronLeft, ChevronRight, FileText, Gauge, Landmark, Package, Receipt, Ship, Truck, UserCog, Users, Files, ClipboardList } from "lucide-react";
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

const NAV_LINK_STYLE =
  "flex items-center gap-2 py-[6px] px-3 text-[12px] font-semibold border-l-[3px] border-transparent text-[#c5d8ec] no-underline";

const NAV_LINK_ACTIVE =
  "bg-[#f0b429] text-[#0d1117] border-l-[3px] border-[#c9900a] font-bold";

const NAV_LINK_HOVER = "hover:bg-[#1a3a5c] hover:text-white hover:border-l-[3px] hover:border-[#4da3ff]";

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

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          backgroundColor: "#0d2137",
          borderRight: "2px solid #071524",
          width: "220px",
          minWidth: "220px",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 40,
          overflowY: "auto",
          overflowX: "hidden",
          transform: mobileOpen ? "translateX(0)" : undefined,
          transition: "width 0.25s, transform 0.25s",
        }}
        className={`
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:sticky md:top-0 md:h-screen md:translate-x-0 md:flex
          ${collapsed ? "md:!w-0 md:!min-w-0 md:overflow-hidden md:border-r-0" : "md:!w-[220px] md:!min-w-[220px]"}
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        `}
      >
        {/* Logo / Brand Area */}
        <div style={{
          backgroundColor: "#071524",
          borderBottom: "2px solid #030e18",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: "44px",
          flexShrink: 0,
        }}>
          <Link
            to="/"
            onClick={onMobileClose}
            style={{
              fontWeight: "800",
              fontSize: "15px",
              color: "#ffffff",
              textDecoration: "none",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
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
              padding: "2px 4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, paddingTop: "6px", paddingBottom: "12px" }}>

          {/* Main Menu Items */}
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={handleItemClick}
                className={({ isActive }) =>
                  `${NAV_LINK_STYLE} ${NAV_LINK_HOVER} ${isActive ? NAV_LINK_ACTIVE : ""}`
                }
              >
                <Icon size={13} style={{ flexShrink: 0 }} />
                <span style={{ truncate: true }}>{item.label}</span>
              </NavLink>
            );
          })}

          {/* MASTERS Section */}
          <div style={{
            color: "#6b8eac",
            fontSize: "10px",
            fontWeight: "700",
            padding: "10px 12px 3px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            borderTop: "1px solid #1a3a5c",
            marginTop: "6px",
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
                className={({ isActive }) =>
                  `${NAV_LINK_STYLE} ${NAV_LINK_HOVER} ${isActive ? NAV_LINK_ACTIVE : ""}`
                }
              >
                <Icon size={13} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* ADMIN Section */}
          {visibleAdminItems.length > 0 && (
            <>
              <div style={{
                color: "#6b8eac",
                fontSize: "10px",
                fontWeight: "700",
                padding: "10px 12px 3px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                borderTop: "1px solid #1a3a5c",
                marginTop: "6px",
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
                    className={({ isActive }) =>
                      `${NAV_LINK_STYLE} ${NAV_LINK_HOVER} ${isActive ? NAV_LINK_ACTIVE : ""}`
                    }
                  >
                    <Icon size={13} style={{ flexShrink: 0 }} />
                    <span>{item.label}</span>
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
