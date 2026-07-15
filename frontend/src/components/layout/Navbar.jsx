import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const roleLabel = { masterAdmin:"Master Admin", admin:"Admin", user:"User" }[user?.role] || "User";
  const initials = (user?.name || "U").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header className="erp-header">
      {/* Menu toggle */}
      <button
        onClick={onMenuClick}
        className="btn btn-ghost btn-icon"
        aria-label="Toggle sidebar"
        style={{ flexShrink:0 }}
      >
        <Menu size={18} />
      </button>

      {/* Global Search */}
      <div className="header-search">
        <Search size={13} className="header-search-icon" />
        <input type="search" placeholder="Search containers, documents, importers…" />
      </div>

      <div style={{ flex:1 }} />

      {/* Company / Year tag */}
      <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
        <span className="badge badge-indigo" style={{ fontSize:"11px" }}>RBC Import &amp; Export</span>
        <span className="badge badge-slate" style={{ fontSize:"11px" }}>FY 2025–26</span>
      </div>

      <div className="header-divider" />

      {/* Notifications */}
      <button className="header-badge-btn" aria-label="Notifications">
        <Bell size={15} />
        <span className="dot" />
      </button>

      <div className="header-divider" />

      {/* User */}
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        <div className="header-meta">
          <div className="header-meta-name">{user?.name || "ERP User"}</div>
          <div className="header-meta-role">{roleLabel}</div>
        </div>
        <div className="header-avatar">{initials}</div>
      </div>

      <div className="header-divider" />

      {/* Logout */}
      <button
        onClick={logout}
        className="btn btn-secondary btn-sm"
        style={{ gap:"5px" }}
      >
        <LogOut size={13} />
        Logout
      </button>
    </header>
  );
};

export default Navbar;
