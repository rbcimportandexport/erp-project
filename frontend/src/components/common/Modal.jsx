import { useEffect } from "react";
import Button from "./Button";

const Modal = ({ open, title, children, onClose, footer, subtitle = "Record Editor" }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      setTimeout(() => {
        const activeModals = document.querySelectorAll(".modal-backdrop");
        if (activeModals.length === 0) {
          document.body.style.overflow = "";
        }
      }, 0);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">{subtitle}</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{title}</h2>
          </div>
          <Button variant="secondary" className="h-10 shrink-0 rounded-xl px-4" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="max-h-[66vh] overflow-y-auto p-6 scrollbar-thin">{children}</div>
        {footer && <div className="border-t border-slate-200 bg-slate-50 px-6 py-5">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
