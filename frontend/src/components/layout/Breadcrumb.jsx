import { Link, useLocation } from "react-router-dom";

const Breadcrumb = () => {
  const parts = useLocation().pathname.split("/").filter(Boolean);

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
      <Link to="/" className="hover:text-brand-600">Home</Link>
      {parts.map((part, index) => {
        const to = `/${parts.slice(0, index + 1).join("/")}`;
        return (
          <span key={to} className="flex items-center gap-2">
            <span>/</span>
            <Link to={to} className="capitalize hover:text-brand-600">{part.replaceAll("-", " ")}</Link>
          </span>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
