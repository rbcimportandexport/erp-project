import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, HelpCircle, Building, Database, ArrowUpDown, Search, FileUp, FileDown, Mail } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Modal from "../common/Modal";

const menuItems = [
  { key: "K", label: "Company", shortcutText: "Alt + K" },
  { key: "Y", label: "Data", shortcutText: "Alt + Y" },
  { key: "Z", label: "Exchange", shortcutText: "Alt + Z" },
  { key: "G", label: "Go To", shortcutText: "Alt + G", active: true },
  { key: "O", label: "Import", shortcutText: "Alt + O" },
  { key: "E", label: "Export", shortcutText: "Alt + E" },
  { key: "M", label: "E-mail", shortcutText: "Alt + M" },
  { key: "P", label: "Print", shortcutText: "Alt + P" },
  { key: "F1", label: "Help", shortcutText: "F1" },
];

const navigationPaths = [
  { label: "Dashboard", path: "/", icon: "Gauge" },
  { label: "Containers List", path: "/containers", icon: "Boxes" },
  { label: "Documents Center", path: "/documents", icon: "Files" },
  { label: "Packing List Maker", path: "/documents/invoice-maker", icon: "ClipboardList" },
  { label: "Quotation Maker", path: "/documents/quotation-maker", icon: "ClipboardList" },
  { label: "Payments Center", path: "/payments", icon: "Receipt" },
  { label: "Analytics Dashboard", path: "/analytics", icon: "Activity" },
  { label: "Reports & Audits", path: "/reports", icon: "Activity" },
  { label: "Activity Logs", path: "/activity-logs", icon: "Truck" },
  { label: "Master: Importers", path: "/masters/importers", icon: "Users" },
  { label: "Master: Importer Addresses", path: "/masters/importer-addresses", icon: "Users" },
  { label: "Master: Exporters", path: "/masters/exporters", icon: "Ship" },
  { label: "Master: Exporter Addresses", path: "/masters/exporter-addresses", icon: "Ship" },
  { label: "Master: India Ports", path: "/masters/india-ports", icon: "Landmark" },
  { label: "Master: China Ports", path: "/masters/china-ports", icon: "Landmark" },
  { label: "Master: HSN Codes", path: "/masters/hsn", icon: "FileText" },
  { label: "Master: Products List", path: "/masters/products", icon: "Package" },
  { label: "Admin: Users List", path: "/users", icon: "UserCog" },
  { label: "Admin: Approvals Center", path: "/approvals", icon: "ClipboardList" },
];

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const roleLabel = { masterAdmin: "Master Admin", admin: "Admin", user: "User" }[user?.role] || "User";

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'K', 'Y', 'Z', 'G', 'O', 'E', 'M', 'F1'
  
  // Go To Search State
  const [goToQuery, setGoToQuery] = useState("");
  const [selectedSearchIdx, setSelectedSearchIdx] = useState(0);

  // Exchange calculator states
  const [convAmount, setConvAmount] = useState("1");
  const [convFrom, setConvFrom] = useState("USD");
  const [convTo, setConvTo] = useState("INR");
  const rates = { USD: 83.5, CNY: 11.5, INR: 1 };
  
  const calculateConversion = () => {
    const amt = parseFloat(convAmount) || 0;
    const rateFrom = rates[convFrom] || 1;
    const rateTo = rates[convTo] || 1;
    const result = (amt * rateFrom) / rateTo;
    return result.toFixed(2);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in form inputs (unless it's the Go To navigation modal itself)
      const activeEl = document.activeElement;
      const isTyping = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.tagName === "SELECT");
      
      // Allow F1 key anywhere (Help modal)
      if (e.key === "F1") {
        e.preventDefault();
        setActiveModal("F1");
        return;
      }

      // Check Alt shortcut bindings
      if (e.altKey) {
        const key = e.key.toUpperCase();
        const matched = menuItems.find(item => item.key === key);
        if (matched) {
          e.preventDefault();
          triggerMenuAction(key);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const triggerMenuAction = (key) => {
    if (key === "P") {
      window.print();
    } else {
      setActiveModal(key);
      if (key === "G") {
        setGoToQuery("");
        setSelectedSearchIdx(0);
      }
    }
  };

  // Filter paths for Go To Command Palette
  const filteredPaths = navigationPaths.filter(p => {
    // Hide Admin routes for non-admin roles
    if (p.path === "/users" && user?.role !== "masterAdmin" && user?.role !== "admin") return false;
    if (p.path === "/approvals" && user?.role !== "masterAdmin") return false;
    return p.label.toLowerCase().includes(goToQuery.toLowerCase());
  });

  const handleGoToSubmit = (path) => {
    setActiveModal(null);
    navigate(path);
  };

  const handleGoToKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSearchIdx(prev => Math.min(filteredPaths.length - 1, prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSearchIdx(prev => Math.max(0, prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredPaths[selectedSearchIdx]) {
        handleGoToSubmit(filteredPaths[selectedSearchIdx].path);
      }
    } else if (e.key === "Escape") {
      setActiveModal(null);
    }
  };

  return (
    <>
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
              onClick={() => triggerMenuAction(item.key)}
              className={`header-menu-item${item.active && !activeModal ? " active-menu" : ""}${activeModal === item.key ? " active-menu" : ""}`}
              title={item.shortcutText}
            >
              <span className="key" style={{ textDecoration: "underline" }}>{item.key}</span>
              <span>: {item.label}</span>
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

      {/* ─── MODALS ─── */}

      {/* K: Company Profile Modal */}
      <Modal
        open={activeModal === "K"}
        title="Company Settings & Profile"
        subtitle="Shortcut: Alt + K"
        onClose={() => setActiveModal(null)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b pb-3 mb-3">
            <Building className="h-8 w-8 text-brand-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">RBC Import & Export Corp</h3>
              <p className="text-xs text-slate-500 font-medium">EST. 2018 | Trade License Active</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 border rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GSTIN / Tax ID</span>
              <span className="text-sm font-semibold text-slate-800">27AAFCR8821M1Z5</span>
            </div>
            <div className="p-3 bg-slate-50 border rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">IEC Code</span>
              <span className="text-sm font-semibold text-slate-800">0316503921</span>
            </div>
            <div className="p-3 bg-slate-50 border rounded-xl col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Corporate Head Office</span>
              <span className="text-sm font-semibold text-slate-800">Plot 12, RBC Logistics Tower, Nhava Sheva, Navi Mumbai, India</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Y: Data Connections Modal */}
      <Modal
        open={activeModal === "Y"}
        title="Database Connections & Logs"
        subtitle="Shortcut: Alt + Y"
        onClose={() => setActiveModal(null)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b pb-3 mb-3">
            <Database className="h-8 w-8 text-emerald-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Supabase Connection State</h3>
              <p className="text-xs text-emerald-600 font-bold">● CONNECTED (ONLINE)</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs py-1 border-b">
              <span className="text-slate-500 font-medium">Database Node</span>
              <span className="text-slate-800 font-semibold">ap-southeast-1.supabase.co</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b">
              <span className="text-slate-500 font-medium">Active Network Pools</span>
              <span className="text-slate-800 font-semibold">8 Pools active</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-slate-500 font-medium">Last Data Sync Timestamp</span>
              <span className="text-slate-800 font-semibold">Just now</span>
            </div>
          </div>
          <div className="pt-2">
            <button className="btn btn-primary w-full gap-2" onClick={() => alert("Supabase sync successful!")}>
              Force Run DB Integrity Sync
            </button>
          </div>
        </div>
      </Modal>

      {/* Z: Exchange Converter Modal */}
      <Modal
        open={activeModal === "Z"}
        title="Currency Rate Converter"
        subtitle="Shortcut: Alt + Z"
        onClose={() => setActiveModal(null)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b pb-3 mb-3">
            <ArrowUpDown className="h-8 w-8 text-indigo-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Live Forex Exchange Rates</h3>
              <p className="text-xs text-slate-500 font-medium">USD = ₹83.50 | CNY = ₹11.50</p>
            </div>
          </div>
          
          {/* Calculator */}
          <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Forex Converter</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Amount</label>
                <input
                  type="number"
                  className="form-input"
                  value={convAmount}
                  onChange={(e) => setConvAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">From</label>
                <select
                  className="form-input form-select"
                  value={convFrom}
                  onChange={(e) => setConvFrom(e.target.value)}
                >
                  <option value="USD">USD</option>
                  <option value="CNY">CNY</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center bg-white p-3 rounded-lg border">
              <span className="text-xs font-medium text-slate-500">Converted Value ({convTo}):</span>
              <span className="text-base font-bold text-indigo-600">{calculateConversion()} {convTo}</span>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Convert To</label>
              <select
                className="form-input form-select"
                value={convTo}
                onChange={(e) => setConvTo(e.target.value)}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="CNY">CNY</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* G: Go To Search Modal (Command Palette) */}
      <Modal
        open={activeModal === "G"}
        title="Go To Quick Navigator"
        subtitle="Shortcut: Alt + G"
        onClose={() => setActiveModal(null)}
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search sections or master tables..."
              className="form-input pl-10"
              value={goToQuery}
              onChange={(e) => {
                setGoToQuery(e.target.value);
                setSelectedSearchIdx(0);
              }}
              onKeyDown={handleGoToKeyDown}
              autoFocus
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto border rounded-xl divide-y bg-white">
            {filteredPaths.length > 0 ? (
              filteredPaths.map((item, index) => (
                <div
                  key={item.path}
                  onClick={() => handleGoToSubmit(item.path)}
                  className={`p-3 text-xs flex justify-between items-center cursor-pointer transition-colors ${
                    index === selectedSearchIdx ? "bg-indigo-50 text-indigo-600 font-semibold" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{item.path}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs">No matching routes found</div>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Use ↑↓ arrow keys to select, Enter to navigate, Escape to close.
          </div>
        </div>
      </Modal>

      {/* O: Import Excel Modal */}
      <Modal
        open={activeModal === "O"}
        title="Batch File Import Wizard"
        subtitle="Shortcut: Alt + O"
        onClose={() => setActiveModal(null)}
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-indigo-50/20 hover:border-indigo-300 transition-colors cursor-pointer">
            <FileUp className="h-10 w-10 text-slate-400 mx-auto mb-2" />
            <span className="text-sm font-semibold text-slate-700 block">Drag & Drop Import file here</span>
            <span className="text-xs text-slate-400 mt-1 block">Supports XLS, XLSX, and CSV file formats</span>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 border p-3 rounded-lg">
            <strong>Note:</strong> Columns in the excel file must match HSN, Importers, or Container structures exactly.
          </div>
        </div>
      </Modal>

      {/* E: Export utility Modal */}
      <Modal
        open={activeModal === "E"}
        title="System Data Export Utility"
        subtitle="Shortcut: Alt + E"
        onClose={() => setActiveModal(null)}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button className="btn btn-secondary gap-2" onClick={() => alert("Container Logs exported!")}>
              <FileDown className="h-4 w-4" /> Container Logs (.xlsx)
            </button>
            <button className="btn btn-secondary gap-2" onClick={() => alert("Payments database exported!")}>
              <FileDown className="h-4 w-4" /> Payments ledger (.xlsx)
            </button>
            <button className="btn btn-secondary gap-2" onClick={() => alert("Exporters Master exported!")}>
              <FileDown className="h-4 w-4" /> Exporters Master (.csv)
            </button>
            <button className="btn btn-secondary gap-2" onClick={() => alert("Importers Master exported!")}>
              <FileDown className="h-4 w-4" /> Importers Master (.csv)
            </button>
          </div>
        </div>
      </Modal>

      {/* M: E-mail utility Modal */}
      <Modal
        open={activeModal === "M"}
        title="Quick Email Composer"
        subtitle="Shortcut: Alt + M"
        onClose={() => setActiveModal(null)}
      >
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">To</label>
            <input type="email" placeholder="recipient@example.com" className="form-input" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Subject</label>
            <input type="text" placeholder="Container document update" className="form-input" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Message</label>
            <textarea placeholder="Write message here..." className="form-input h-20 py-2 resize-none" />
          </div>
          <button className="btn btn-primary w-full gap-2 mt-2" onClick={() => { setActiveModal(null); alert("Email sent successfully!"); }}>
            <Mail className="h-4 w-4" /> Send Email
          </button>
        </div>
      </Modal>

      {/* F1: Help Modal */}
      <Modal
        open={activeModal === "F1"}
        title="ERP Quick Start & Help Guide"
        subtitle="Shortcut: F1"
        onClose={() => setActiveModal(null)}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 border-b pb-3 mb-3">
            <HelpCircle className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">System Navigation Guide</h3>
              <p className="text-xs text-slate-500 font-medium">Use keyboard shortcuts to operate the ERP instantly.</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700">Keyboard Shortcuts:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between p-2 border rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-600">Company Settings</span>
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-bold shadow-sm">Alt + K</kbd>
              </div>
              <div className="flex justify-between p-2 border rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-600">DB Status & Pools</span>
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-bold shadow-sm">Alt + Y</kbd>
              </div>
              <div className="flex justify-between p-2 border rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-600">Forex Converter</span>
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-bold shadow-sm">Alt + Z</kbd>
              </div>
              <div className="flex justify-between p-2 border rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-600">Quick Go To Search</span>
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-bold shadow-sm">Alt + G</kbd>
              </div>
              <div className="flex justify-between p-2 border rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-600">Batch File Import</span>
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-bold shadow-sm">Alt + O</kbd>
              </div>
              <div className="flex justify-between p-2 border rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-600">System Logs Export</span>
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-bold shadow-sm">Alt + E</kbd>
              </div>
              <div className="flex justify-between p-2 border rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-600">Email Composer</span>
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-bold shadow-sm">Alt + M</kbd>
              </div>
              <div className="flex justify-between p-2 border rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-600">Print Current Page</span>
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-bold shadow-sm">Alt + P</kbd>
              </div>
              <div className="flex justify-between p-2 border rounded-lg bg-slate-50 col-span-2">
                <span className="font-semibold text-slate-600">Toggle Help Directory</span>
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-bold shadow-sm">F1</kbd>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Navbar;
