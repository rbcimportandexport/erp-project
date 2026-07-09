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

const hsnChapters = [
  { value: "", label: "All Chapters" },
  { value: "32", label: "Chapter 32 - Tanning/Dyeing" },
  { value: "33", label: "Chapter 33 - Cosmetics/Toiletries" },
  { value: "34", label: "Chapter 34 - Soaps/Lubricants" },
  { value: "35", label: "Chapter 35 - Albumins/Glues" },
  { value: "38", label: "Chapter 38 - Chemical Products" },
  { value: "39", label: "Chapter 39 - Plastics" },
  { value: "40", label: "Chapter 40 - Rubber" },
  { value: "42", label: "Chapter 42 - Leather Articles" },
  { value: "48", label: "Chapter 48 - Paper/Paperboard" },
  { value: "49", label: "Chapter 49 - Printed Books" },
  { value: "56", label: "Chapter 56 - Wadding/Felt/Yarn" },
  { value: "58", label: "Chapter 58 - Special Fabrics" },
  { value: "59", label: "Chapter 59 - Coated Fabrics" },
  { value: "61", label: "Chapter 61 - Apparel (Knitted)" },
  { value: "62", label: "Chapter 62 - Apparel (Not Knitted)" },
  { value: "63", label: "Chapter 63 - Other Textile Articles" },
  { value: "64", label: "Chapter 64 - Footwear" },
  { value: "65", label: "Chapter 65 - Headgear" },
  { value: "66", label: "Chapter 66 - Umbrellas" },
  { value: "67", label: "Chapter 67 - Wigs/Feathers" },
  { value: "68", label: "Chapter 68 - Stone/Cement Articles" },
  { value: "69", label: "Chapter 69 - Ceramic Products" },
  { value: "70", label: "Chapter 70 - Glass & Glassware" },
  { value: "71", label: "Chapter 71 - Pearls/Precious Stones" },
  { value: "73", label: "Chapter 73 - Articles of Iron/Steel" },
  { value: "76", label: "Chapter 76 - Aluminum" },
  { value: "82", label: "Chapter 82 - Tools & Cutlery" },
  { value: "83", label: "Chapter 83 - Metal Articles" },
  { value: "84", label: "Chapter 84 - Machinery/Boilers" },
  { value: "85", label: "Chapter 85 - Electrical Equipment" },
  { value: "87", label: "Chapter 87 - Vehicles" },
  { value: "90", label: "Chapter 90 - Optical/Measuring" },
  { value: "91", label: "Chapter 91 - Clocks/Watches" },
  { value: "94", label: "Chapter 94 - Furniture/Bedding" },
  { value: "95", label: "Chapter 95 - Toys/Sports" },
  { value: "96", label: "Chapter 96 - Misc Manufactured" },
  { value: "97", label: "Chapter 97 - Works of Art" },
];

export const masterRowClass = () => "bg-white ring-1 ring-slate-200 hover:-translate-y-0.5 hover:ring-brand-200";

export const MasterHeader = ({
  items,
  total,
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
  sort,
  setSort,
  customFilters,
  setCustomFilters,
}) => {
  const displayTotal = typeof total === "number" ? total : items.length;

  return (
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
            <p className="text-xl font-black text-slate-950">{displayTotal}</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">{statTwoLabel}</p>
            <p className="text-xl font-black text-blue-700">{displayTotal}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-600">{statThreeLabel}</p>
            <p className="text-xl font-black text-emerald-700">{displayTotal}</p>
          </div>
          <Button className="h-12 rounded-2xl px-5 font-black" onClick={openAdd}>
            {addLabel || `Add ${title}`}
          </Button>
        </div>
      </div>

    <div className="mt-5 flex flex-col md:flex-row gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2">
      <div className="flex-1">
        <SearchBar value={search} onChange={setSearch} placeholder={searchPlaceholder || `Search ${title.toLowerCase()}`} />
      </div>
      {title === "HSN Codes" && setCustomFilters && (
        <select
          value={customFilters?.chapters || ""}
          onChange={(e) => setCustomFilters({ ...customFilters, chapters: e.target.value })}
          className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50"
        >
          {hsnChapters.map((ch) => (
            <option key={ch.value} value={ch.value}>
              {ch.label}
            </option>
          ))}
        </select>
      )}
      {setSort && (
        <select
          value={sort || "-createdAt"}
          onChange={(e) => setSort(e.target.value)}
          className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50"
        >
          <option value="-createdAt">Newest First</option>
          <option value="code">Code (A-Z)</option>
          <option value="-code">Code (Z-A)</option>
          <option value="description">Description (A-Z)</option>
          <option value="-description">Description (Z-A)</option>
          {title === "HSN Codes" && (
            <>
              <option value="dutyRate">Duty (Low to High)</option>
              <option value="-dutyRate">Duty (High to Low)</option>
              <option value="gstRate">GST (Low to High)</option>
              <option value="-gstRate">GST (High to Low)</option>
            </>
          )}
        </select>
      )}
  </div>
  );
};

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
