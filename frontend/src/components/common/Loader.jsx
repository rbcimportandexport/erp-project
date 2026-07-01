import { Loader2 } from "lucide-react";

const Loader = ({ label = "Loading" }) => (
  <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-slate-500">
    <Loader2 className="h-5 w-5 animate-spin" />
    <span>{label}</span>
  </div>
);

export default Loader;
