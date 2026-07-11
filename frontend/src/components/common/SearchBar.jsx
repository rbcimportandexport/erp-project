import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search" }) => (
  <div className="relative">
    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm outline-none transition-all focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
    />
  </div>
);

export default SearchBar;
