import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

const SortIcon = ({ state }) => {
  if (state === "asc")  return <ArrowUp size={11} style={{ opacity:0.9, color:"var(--indigo)" }} />;
  if (state === "desc") return <ArrowDown size={11} style={{ opacity:0.9, color:"var(--indigo)" }} />;
  return <ArrowUpDown size={10} style={{ opacity:0.3 }} />;
};

const Table = ({ columns, data = [], getRowClassName, meta }) => {
  const table = useReactTable({
    data, columns, meta,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="erp-table-wrap">
      <div className="erp-table-inner">
        <table className="erp-table">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}
                  >
                    <span style={{ display:"inline-flex", alignItems:"center", gap:"5px" }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && <SortIcon state={header.column.getIsSorted()} />}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className={getRowClassName ? getRowClassName(row.original) : ""}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="erp-table-empty">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
