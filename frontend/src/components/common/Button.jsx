import { Loader2 } from "lucide-react";

const Button = ({ children, type = "button", variant = "primary", loading = false, className = "", ...props }) => {
  const styles = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm active:scale-[0.98] duration-150",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm active:scale-[0.98] duration-150",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-[0.98] duration-150",
    ghost: "text-slate-700 hover:bg-slate-50 hover:text-slate-900 duration-150",
  };

  return (
    <button
      type={type}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap ${styles[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
