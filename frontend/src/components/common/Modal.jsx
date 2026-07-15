import { useEffect } from "react";
import Button from "./Button";

import { X } from "lucide-react";

const Modal = ({ open, title, children, onClose, footer, subtitle = "Record Editor" }) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };

  }, [open]);

  if (!open) return null;

  return (

    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel anim-fade">
        <div className="modal-header">
          <div>
            <div className="modal-subtitle">{subtitle}</div>
            <h2 className="modal-title">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            aria-label="Close"
            style={{ flexShrink:0 }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}

      </div>
    </div>
  );
};

export default Modal;
