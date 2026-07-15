import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

const Pagination = ({ page, pages, total = 0, limit = 10, onPageChange, onLimitChange }) => {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-4 text-slate-500 font-medium">
        <span>Showing {start}-{end} of {total} records</span>
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
            <span>per page</span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="flex items-center justify-center gap-1 active:scale-95 transition-all duration-150"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4 shrink-0" />
          Prev
        </Button>
        <Button
          variant="secondary"
          className="flex items-center justify-center gap-1 active:scale-95 transition-all duration-150"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4 shrink-0" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
