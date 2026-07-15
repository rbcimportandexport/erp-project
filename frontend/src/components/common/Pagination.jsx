import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, pages, total = 0, limit = 10, onPageChange, onLimitChange }) => {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap",
      gap:"12px", borderTop:"1px solid var(--border)", padding:"10px 16px",
      background:"var(--surface)", fontSize:"12px", color:"var(--text-3)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:"14px", flexWrap:"wrap" }}>
        <span>Showing <strong style={{ color:"var(--text-1)" }}>{start}–{end}</strong> of <strong style={{ color:"var(--text-1)" }}>{total}</strong> records</span>
        {onLimitChange && (
          <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <span>Show</span>
            <select
              value={limit}
              onChange={e => onLimitChange(Number(e.target.value))}
              className="form-input form-select"
              style={{ height:"28px", width:"72px", fontSize:"12px", padding:"0 26px 0 8px" }}
            >
              {[10,20,50,100,200,500].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <span>per page</span>
          </div>
        )}
      </div>
      <div className="pagination">
        <button className="page-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft size={13} />
        </button>
        {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
          const p = i + 1;
          return (
            <button key={p} className={`page-btn${page === p ? " active" : ""}`} onClick={() => onPageChange(p)}>
              {p}
            </button>
          );
        })}
        {pages > 7 && page < pages && <span style={{ padding:"0 4px", color:"var(--text-4)" }}>…</span>}
        {pages > 7 && (
          <button className={`page-btn${page === pages ? " active" : ""}`} onClick={() => onPageChange(pages)}>
            {pages}
          </button>
        )}
        <button className="page-btn" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
