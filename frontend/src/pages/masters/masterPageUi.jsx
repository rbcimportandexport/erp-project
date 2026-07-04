import Button from "../../components/common/Button";
import SearchBar from "../../components/common/SearchBar";

const getInitials = (value) => {
  const words = String(value || "-")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "--";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export const masterRowClass = () => "bg-white ring-1 ring-slate-200 hover:-translate-y-0.5 hover:ring-brand-200";

export const MasterHeader = ({
  items,
  openAdd,
  search,
  setSearch,
  title,
  addLabel,
  description = "Name par click karo, edit direct open hoga.",
  searchPlaceholder,
  statOneLabel = "Total Records",
  statTwoLabel = "Active Master",
  statThreeLabel = "Ready For Use",
}) => (
  <div className="mb-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-lg font-black text-brand-700 ring-1 ring-brand-100">
          {getInitials(title)}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Master Directory</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{title}</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{statOneLabel}</p>
          <p className="text-xl font-black text-slate-950">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">{statTwoLabel}</p>
          <p className="text-xl font-black text-blue-700">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">{statThreeLabel}</p>
          <p className="text-xl font-black text-emerald-700">{items.length}</p>
        </div>
        <Button className="h-12 rounded-2xl px-5 font-black" onClick={openAdd}>
          {addLabel || `Add ${title}`}
        </Button>
      </div>
    </div>

    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-2">
      <SearchBar value={search} onChange={setSearch} placeholder={searchPlaceholder || `Search ${title.toLowerCase()}`} />
    </div>
  </div>
);

export const EditCellButton = ({ row, table, children }) => {
  const label = String(children || "-");

  return (
    <button
      type="button"
      className="group inline-flex min-w-[220px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left font-black text-slate-900 shadow-sm transition hover:border-brand-200 hover:bg-brand-50"
      onClick={() => table.options.meta?.openEdit?.(row.original)}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white transition group-hover:bg-brand-700">
        {getInitials(label)}
      </span>
      <span className="max-w-[320px] truncate">{label}</span>
    </button>
  );
};
