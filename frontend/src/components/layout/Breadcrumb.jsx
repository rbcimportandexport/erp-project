import { Link, useLocation } from "react-router-dom";

import { ChevronRight, Home } from "lucide-react";


const Breadcrumb = () => {
  const parts = useLocation().pathname.split("/").filter(Boolean);

  return (

    <nav className="breadcrumb" aria-label="breadcrumb">
      <Link to="/" style={{ display:"flex", alignItems:"center", gap:"3px" }}>
        <Home size={11} />
        Home
      </Link>
      {parts.map((part, index) => {
        const to = `/${parts.slice(0, index + 1).join("/")}`;
        const label = part.replaceAll("-", " ").replace(/\b\w/g, c => c.toUpperCase());
        const isLast = index === parts.length - 1;
        return (
          <span key={to} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
            <ChevronRight size={11} className="breadcrumb-sep" />
            {isLast
              ? <span className="current">{label}</span>
              : <Link to={to}>{label}</Link>
            }
          </span>
        );
      })}
    </nav>

  );
};

export default Breadcrumb;
