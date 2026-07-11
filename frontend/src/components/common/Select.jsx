const Select = ({ label, error, options = [], className = "", ...props }) => (
  <label className="block">
    {label && <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>}
    <select
      className={`h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none transition-all focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 ${className}`}
      {...props}
    >
      <option value="">Select</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </label>
);

export default Select;
