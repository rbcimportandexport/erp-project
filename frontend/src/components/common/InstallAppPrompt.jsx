import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;

const InstallAppPrompt = () => {
  const [installEvent, setInstallEvent] = useState(null);
  const [show, setShow] = useState(false);
  const [showManualHelp, setShowManualHelp] = useState(false);
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isMobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);

  useEffect(() => {
    if (isStandalone() || sessionStorage.getItem("rbc-install-prompt-dismissed")) return undefined;

    const onBeforeInstall = (event) => {
      event.preventDefault();
      setInstallEvent(event);
      setShow(true);
    };
    const onInstalled = () => {
      setShow(false);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    let mobileTimer;
    if (isMobile) mobileTimer = window.setTimeout(() => setShow(true), 1200);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      if (mobileTimer) window.clearTimeout(mobileTimer);
    };
  }, [isMobile]);

  const install = async () => {
    if (installEvent) {
      setShow(false);
      await installEvent.prompt();
      await installEvent.userChoice;
      setInstallEvent(null);
      return;
    }
    setShowManualHelp(true);
  };

  const dismiss = () => {
    sessionStorage.setItem("rbc-install-prompt-dismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-4 z-[100] mx-auto max-w-md rounded-3xl border border-slate-700 bg-slate-950 p-4 text-white shadow-2xl sm:inset-x-auto sm:right-5">
      <button type="button" onClick={dismiss} className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close install prompt">
        <X className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-3 pr-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1 shadow-inner">
          <img src="/rbc-app-logo.webp" alt="RBC ERP" className="h-full w-full object-contain" />
        </div>
        <div>
          <p className="font-black">Download RBC ERP App</p>
          <p className="text-xs text-slate-300">Fast access ke liye phone par install karein.</p>
        </div>
      </div>

      {showManualHelp ? (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm font-semibold">
          <Share className="h-5 w-5 shrink-0 text-blue-300" />
          {isIos
            ? "Safari mein Share dabayein, phir “Add to Home Screen” select karein."
            : "Browser ke 3-dot menu mein “Install app” ya “Add to Home screen” select karein."}
        </div>
      ) : (
        <button type="button" onClick={install} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 font-black transition hover:bg-blue-500">
          <Download className="h-5 w-5" />
          Install App
        </button>
      )}
    </div>
  );
};

export default InstallAppPrompt;
