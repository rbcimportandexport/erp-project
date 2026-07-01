const PdfPreview = ({ path }) => {
  const baseUrl = import.meta.env.VITE_UPLOAD_BASE_URL || "http://localhost:5000";
  const src = path?.startsWith("http") ? path : `${baseUrl}${path}`;

  return <iframe title="Document preview" src={src} className="h-[70vh] w-full rounded-md border border-slate-200" />;
};

export default PdfPreview;
