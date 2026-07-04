import { useState, useEffect } from "react";
import { deleteDocument, getAllDocuments } from "../../api/documentApi";
import Button from "../../components/common/Button";
import PdfPreview from "../../components/common/PdfPreview";
import Table from "../../components/common/Table";
import TopBar from "../../components/layout/TopBar";
import { useAlert } from "../../hooks/useAlert";

const DocumentsPage = () => {
  const [recentDocs, setRecentDocs] = useState([]);
  const [preview, setPreview] = useState("");
  const alert = useAlert();

  const loadRecentDocs = async () => {
    try {
      const response = await getAllDocuments();
      // Only show Packing Lists (CPL) and Commercial Invoices (CBL)
      const filtered = (response.data || []).filter(
        (d) => d.docType === "CPL" || d.docType === "CBL"
      );
      setRecentDocs(filtered);
    } catch (error) {
      console.error("Error loading recent documents", error);
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
      <TopBar title="Documents" />

      {/* Documents Table */}
      <div className="rounded-md bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-bold text-slate-900">Generated Packing Lists & Commercial Invoices</h3>
        <Table
          columns={[
            { header: "Container No", accessorKey: "containerNo" },
            { header: "Document Type", accessorKey: "docType", cell: ({ value }) => value === "CPL" ? "Packing List" : "Commercial Invoice" },
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
      </div>

      {/* Preview Dialog */}
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
