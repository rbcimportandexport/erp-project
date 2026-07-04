import { useState, useEffect } from "react";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteDocument, getAllDocuments } from "../../api/documentApi";
import Button from "../../components/common/Button";
import PdfPreview from "../../components/common/PdfPreview";
import Table from "../../components/common/Table";
import TopBar from "../../components/layout/TopBar";
import { useAlert } from "../../hooks/useAlert";

const DocumentsPage = () => {
  const [recentDocs, setRecentDocs] = useState([]);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const alert = useAlert();
  const navigate = useNavigate();

  const loadRecentDocs = async () => {
    setLoading(true);
    try {
      const response = await getAllDocuments();
      setRecentDocs(response.data || []);
    } catch (error) {
      console.error("Error loading recent documents", error);
      alert.error(error.message || "Documents load nahi ho rahe. Supabase documents table/storage check karo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentDocs();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      alert.success("Document deleted successfully");
      loadRecentDocs();
    } catch (err) {
      alert.error(err.message || "Failed to delete document");
    }
  };

  return (
    <>
      <TopBar
        title="Documents"
        actions={
          <Button onClick={() => navigate("/documents/invoice-maker")}>
            <Plus className="h-4 w-4" />Create Document
          </Button>
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Saved Documents</h3>
            <p className="mt-1 text-sm text-slate-500">
              Packing List Form me Save Document dabane ke baad files yahan dikhenge.
            </p>
          </div>
          <Button variant="secondary" onClick={loadRecentDocs} disabled={loading}>
            Refresh
          </Button>
        </div>

        <Table
          columns={[
            { header: "Container No", accessorKey: "containerNo" },
            {
              header: "Document Type",
              accessorKey: "docType",
              cell: ({ value }) => {
                const labels = {
                  CPL: "Packing List",
                  CBL: "Commercial Invoice",
                  QUOTATION: "Quotation",
                  BOE: "BOE",
                };
                return labels[value] || value || "-";
              },
            },
            { header: "File Name", accessorKey: "fileName" },
            { header: "Actions", cell: ({ row }) => (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setPreview(row.original.filePath)}>Preview</Button>
                <Button variant="danger" onClick={() => handleDelete(row.original._id)}>Delete</Button>
              </div>
            ) },
          ]}
          data={recentDocs}
        />

        {!loading && recentDocs.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-slate-400" />
            <h4 className="mt-3 text-lg font-black text-slate-950">Abhi koi saved document nahi hai</h4>
            <p className="mx-auto mt-2 max-w-xl text-sm font-medium text-slate-500">
              Document list me file dikhane ke liye Packing List Form me details bharo aur Save Document button dabao.
            </p>
            <Button onClick={() => navigate("/documents/invoice-maker")} className="mt-4">
              <Plus className="h-4 w-4" />Go to Packing List Form
            </Button>
          </div>
        ) : null}
      </div>

      {preview && (
        <div className="mt-5 rounded-md bg-white p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-bold text-slate-950">Document Preview</h4>
            <Button variant="secondary" onClick={() => setPreview("")}>Close Preview</Button>
          </div>
          <div className="mt-4 border rounded border-slate-200 overflow-hidden">
            <PdfPreview path={preview} />
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentsPage;
