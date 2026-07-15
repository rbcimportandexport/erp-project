import { Upload } from "lucide-react";

const FileUpload = ({ label = "Upload file", onChange, accept = "application/pdf,image/*" }) => (
  <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600 hover:border-brand-600">
    <Upload className="mb-2 h-6 w-6 text-brand-600" />
    <span className="font-medium">{label}</span>
    <input type="file" accept={accept} className="sr-only" onChange={(event) => onChange(event.target.files?.[0] || null)} />
  </label>
);

export default FileUpload;
