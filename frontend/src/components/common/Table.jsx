import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";

const SortLabel = ({ state }) => {
  if (state === "asc") return <span className="text-[10px] font-black text-brand-700">UP</span>;
  if (state === "desc") return <span className="text-[10px] font-black text-brand-700">DOWN</span>;
  return null;
};

const Table = ({ columns, data = [], getRowClassName, meta, variant = "default" }) => {
  const table = useReactTable({
    data,
    columns,
    meta,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (variant === "cards") {
    return (
      <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="whitespace-nowrap px-4 py-2 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                    <button type="button" onClick={header.column.getToggleSortingHandler()} className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <SortLabel state={header.column.getIsSorted()} />
                    </button>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const cells = row.getVisibleCells();

              return (
                <tr key={row.id} className={`transition duration-200 ${getRowClassName ? getRowClassName(row.original) : "bg-white ring-1 ring-slate-200 hover:bg-slate-50"}`}>
                  {cells.map((cell, index) => (
                    <td
                      key={cell.id}
                      className={`whitespace-nowrap px-4 py-3 text-slate-800 ${index === 0 ? "rounded-l-2xl" : ""} ${index === cells.length - 1 ? "rounded-r-2xl" : ""}`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td className="rounded-2xl bg-white px-4 py-10 text-center text-slate-500" colSpan={columns.length}>
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600">
                  <button type="button" onClick={header.column.getToggleSortingHandler()} className="flex items-center gap-2">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <SortLabel state={header.column.getIsSorted()} />
                  </button>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-100">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={`${getRowClassName ? getRowClassName(row.original) : "hover:bg-slate-50"}`}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="whitespace-nowrap px-4 py-3 text-slate-700">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
