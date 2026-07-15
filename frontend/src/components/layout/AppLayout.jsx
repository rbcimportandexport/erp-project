import { useState } from "react";
import { Outlet } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuClick = () => {
    if (window.innerWidth >= 768) {
      setCollapsed((prev) => !prev);
    } else {
      setMobileOpen((prev) => !prev);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", backgroundColor: "#eef0f3" }}>
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed((value) => !value)} 
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div style={{ display: "flex", flex: 1, flexDirection: "column", minWidth: 0, height: "100%", overflow: "hidden" }}>
        <Navbar onMenuClick={handleMenuClick} />
        <main style={{ flex: 1, overflowY: "auto", padding: "8px 10px", backgroundColor: "#eef0f3" }}>
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
