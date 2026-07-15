import { Loader2 } from "lucide-react";


const variantMap = {
  primary:   "btn btn-primary",
  secondary: "btn btn-secondary",
  danger:    "btn btn-danger",
  ghost:     "btn btn-ghost",
};

const Button = ({ children, type = "button", variant = "primary", loading = false, className = "", ...props }) => (
  <button
    type={type}
    className={`${variantMap[variant] ?? "btn btn-primary"} ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading && <Loader2 size={13} className="animate-spin" />}
    {children}
  </button>
);


export default Button;
