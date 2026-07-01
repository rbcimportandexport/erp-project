import Button from "./Button";

const Pagination = ({ page, pages, onPageChange }) => (
  <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
    <span className="text-slate-500">Page {page} of {Math.max(pages || 1, 1)}</span>
    <div className="flex gap-2">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Prev</Button>
      <Button variant="secondary" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Next</Button>
    </div>
  </div>
);

export default Pagination;
