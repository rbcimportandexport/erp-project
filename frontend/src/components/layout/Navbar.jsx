import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const roleLabel = {
    masterAdmin: "Master Admin",
    admin: "Admin",
    user: "User",
  }[user?.role] || "User";

  return (
    <header
      style={{
        backgroundColor: "#0d2137",
        color: "#e2ecf5",
        borderBottom: "2px solid #071524",
        height: "44px",
        minHeight: "44px",
        maxHeight: "44px",
        padding: "0 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      {/* Menu Toggle Button */}
      <button
        onClick={onMenuClick}
        aria-label="Toggle menu"
        style={{
          background: "transparent",
          border: "1px solid #1a3a5c",
          color: "#c5d8ec",
          padding: "4px 8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Menu size={16} />
      </button>

      {/* App Title — Center */}
      <div style={{
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        textAlign: "center",
      }}>
        <span style={{
          fontWeight: "800",
          fontSize: "13px",
          color: "#ffffff",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          RBC <span style={{ color: "#f0b429" }}>IMPORT &amp; EXPORT ERP</span>
        </span>
      </div>

      {/* User Info + Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: "12px",
            fontWeight: "700",
            color: "#ffffff",
            textTransform: "uppercase",
          }}>
            {user?.name || "ERP User"}
          </div>
          <div style={{
            fontSize: "10px",
            fontWeight: "600",
            color: "#f0b429",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}>
            {roleLabel}
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            background: "transparent",
            border: "1px solid #8b0000",
            color: "#ffaaaa",
            padding: "4px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
            fontWeight: "700",
            textTransform: "uppercase",
          }}
        >
          <LogOut size={12} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
