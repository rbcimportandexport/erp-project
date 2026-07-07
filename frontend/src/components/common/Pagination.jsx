import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

const Pagination = ({ page, pages, onPageChange }) => (
  <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
    <span className="text-slate-500 font-medium">Page {page} of {Math.max(pages || 1, 1)}</span>
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

export default Pagination;
