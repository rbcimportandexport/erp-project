import { useState } from "react";
import { Outlet } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className="min-w-0 flex-1">
        <Navbar onMenuClick={() => setCollapsed((value) => !value)} />
        <main className="p-4 md:p-6">
          <Breadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
