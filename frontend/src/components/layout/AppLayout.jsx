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
      setCollapsed(prev => !prev);
    } else {
      setMobileOpen(prev => !prev);
    }
  };

  return (
    <div className="erp-layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="erp-main">
        <Navbar onMenuClick={handleMenuClick} />
        <main className="erp-content">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
