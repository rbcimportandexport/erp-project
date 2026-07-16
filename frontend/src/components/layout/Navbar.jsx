import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const menuItems = [
  { key: "K", label: "Company" },
  { key: "Y", label: "Data" },
  { key: "Z", label: "Exchange" },
  { key: "G", label: "Go To", active: true },
  { key: "O", label: "Import" },
  { key: "E", label: "Export" },
  { key: "M", label: "E-mail" },
  { key: "P", label: "Print" },
  { key: "F1", label: "Help" },
];

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const roleLabel = { masterAdmin: "Master Admin", admin: "Admin", user: "User" }[user?.role] || "User";

  return (
    <header className="erp-header">
      {/* Sidebar Toggle */}
      <button
        onClick={onMenuClick}
        className="btn btn-ghost btn-icon"
        aria-label="Toggle sidebar"
        style={{ color: "#475569", border: "1px solid #cbd5e1", flexShrink: 0 }}
      >
        <Menu size={16} />
      </button>

      {/* Keyboard shortcut items */}
      <div className="header-menu-items">
        {menuItems.map(item => (
          <div
            key={item.key}
            className={`header-menu-item${item.active ? " active-menu" : ""}`}
          >
            <span className="key">{item.key}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Company name center */}
      <div className="header-company" style={{ flex: "0 0 auto" }}>
        RBC Import &amp; Export
      </div>

      <div className="header-divider" />

      {/* User info */}
      <div className="header-user-info" style={{ flexShrink: 0 }}>
        <div className="header-user-name">{user?.name || "ERP User"}</div>
        <div className="header-user-role">{roleLabel}</div>
      </div>

      <div className="header-divider" />

      {/* Logout */}
      <button
        onClick={logout}
        className="btn btn-danger btn-sm"
        style={{ flexShrink: 0, gap: "4px" }}
      >
        <LogOut size={13} />
        Logout
      </button>
    </header>
  );
};

export default Navbar;
