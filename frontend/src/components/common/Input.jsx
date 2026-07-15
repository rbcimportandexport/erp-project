import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(({ label, error, className = "", type = "text", ...props }, ref) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPwd = type === "password";
  const inputType = isPwd ? (showPwd ? "text" : "password") : type;

  return (
    <div className="form-field">
      {label && <span className="form-label">{label}</span>}
      <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
        <input
          ref={ref}
          type={inputType}
          className={`form-input ${isPwd ? "pr-9" : ""} ${className}`}
          {...props}
        />
        {isPwd && (
          <button
            type="button"
            onClick={() => setShowPwd(p => !p)}
            style={{ position:"absolute", right:"9px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text-4)", display:"flex", alignItems:"center" }}
            aria-label={showPwd ? "Hide" : "Show"}
          >
            {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
