const Loader = ({ label = "Loading" }) => (
  <div className="flex min-h-[16rem] flex-col items-center justify-center gap-4">
    <div className="relative flex h-12 w-12 items-center justify-center">
      {/* Outer Ring */}
      <div className="absolute inset-0 rounded-full border-4 border-brand-50 border-t-brand-600 animate-spin"></div>
      {/* Inner Ring */}
      <div className="absolute h-8 w-8 rounded-full border-4 border-slate-100 border-b-brand-600 animate-[spin_1.5s_linear_infinite_reverse]"></div>
    </div>
    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">
      {label}
    </span>
  </div>
);

export default Loader;
