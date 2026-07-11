import { useState } from "react";
import { Outlet } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100">
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed((value) => !value)} 
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        <Navbar onMenuClick={() => setMobileOpen((value) => !value)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
