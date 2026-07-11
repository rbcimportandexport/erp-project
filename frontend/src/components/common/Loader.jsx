import { Loader2 } from "lucide-react";

const Loader = ({ label = "Loading" }) => (
  <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3">
    <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
    <span className="text-xs font-semibold tracking-wider text-slate-500">
      {label}...
    </span>
  </div>
);

export default Loader;
