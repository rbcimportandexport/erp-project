import { useState, useEffect } from "react";
import { FileText, Plus, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { deleteDocument, getAllDocuments, uploadDocument } from "../../api/documentApi";
import containerApi from "../../api/containerApi";
import Button from "../../components/common/Button";
import PdfPreview from "../../components/common/PdfPreview";
import Table from "../../components/common/Table";
import TopBar from "../../components/layout/TopBar";
import Modal from "../../components/common/Modal";
import Select from "../../components/common/Select";
import { useAlert } from "../../hooks/useAlert";

const DocumentsPage = () => {
  const [recentDocs, setRecentDocs] = useState([]);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [containers, setContainers] = useState([]);
  const [selectedContainer, setSelectedContainer] = useState("");
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
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
    const fetchContainers = async () => {
      try {
        const res = await containerApi.list({ limit: 1000, sort: "-containerSeq" });
        setContainers(res.data?.items || []);
      } catch (err) {
        console.error("Error fetching containers:", err);
      }
    };
    fetchContainers();
  }, []);

  const handleUploadSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedContainer || !docType || !file) {
      alert.error("Please fill all fields and select a file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", docType);

      await uploadDocument(selectedContainer, formData);
      alert.success("Document uploaded successfully");
      setUploadOpen(false);
      setSelectedContainer("");
      setDocType("");
      setFile(null);
      loadRecentDocs();
    } catch (err) {
      alert.error(err.response?.data?.message || err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

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
          <div className="flex gap-2">
            <Button onClick={() => setUploadOpen(true)} variant="secondary">
              <Upload className="h-4 w-4" />Upload Document
            </Button>
            <Button onClick={() => navigate("/documents/invoice-maker")}>
              <Plus className="h-4 w-4" />Create Document
            </Button>
          </div>
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
            {
              header: "Invoice No",
              cell: ({ row }) => {
                const fileName = row.original.fileName || "";
                const cleanName = fileName.replace(/\.pdf$/i, "");
                const prefixes = ["Commercial_Invoice_", "Packing_List_", "Quotation_"];
                for (const prefix of prefixes) {
                  if (cleanName.startsWith(prefix)) {
                    return cleanName.substring(prefix.length);
                  }
                }
                return cleanName || "-";
              }
            },
            {
              header: "Container No",
              accessorKey: "containerNo",
              cell: ({ value, row }) => {
                if (value && value !== "-") return value;
                const fileName = row.original.fileName || "";
                const cleanName = fileName.replace(/\.pdf$/i, "");
                const prefixes = ["Commercial_Invoice_", "Packing_List_", "Quotation_"];
                let invoiceNo = cleanName;
                for (const prefix of prefixes) {
                  if (cleanName.startsWith(prefix)) {
                    invoiceNo = cleanName.substring(prefix.length);
                    break;
                  }
                }
                if (invoiceNo && (invoiceNo.toUpperCase().startsWith("RBC") || /RBC/i.test(invoiceNo))) {
                  return invoiceNo;
                }
                return value || "-";
              }
            },
            {
              header: "Document Type",
              accessorKey: "docType",
              cell: ({ value, row }) => {
                const labels = {
                  CPL: "1. CPL",
                  CBL: "2. CBL",
                  MD: "3. MD",
                  ECPL: "4. ECPL",
                  FECPL: "5. FECPL",
                  "P&I": "6. P&I",
                  BL: "7. BL",
                  CHECKLIST: "8. CHECKLIST",
                  "LINE INVOICE": "9. LINE INVOICE",
                  BOE: "10. BOE",
                  "E-WAY BILL": "11. E-WAY BILL",
                  "CHA PHOTO FILE": "12. CHA PHOTO FILE",
                  QUOTATION: "Quotation",
                };
                let resolved = labels[value] || value;
                if (!resolved || resolved === "-") {
                  const fName = row.original.fileName || "";
                  if (fName.startsWith("Commercial_Invoice_")) return "Commercial Invoice";
                  if (fName.startsWith("Packing_List_")) return "Packing List";
                  if (fName.startsWith("Quotation_")) return "Quotation";
                }
                return resolved || "-";
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

      {uploadOpen && (
        <Modal
          open={uploadOpen}
          title="Upload Document"
          onClose={() => setUploadOpen(false)}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button>
              <Button onClick={handleUploadSubmit} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <Select
              label="Select Container"
              value={selectedContainer}
              onChange={(e) => setSelectedContainer(e.target.value)}
              required
              options={containers.map((c) => ({ value: c._id || c.id, label: c.containerNo }))}
            />

            <Select
              label="Document Type"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              required
              options={[
                { value: "CPL", label: "1. CPL" },
                { value: "CBL", label: "2. CBL" },
                { value: "MD", label: "3. MD" },
                { value: "ECPL", label: "4. ECPL" },
                { value: "FECPL", label: "5. FECPL" },
                { value: "P&I", label: "6. P&I" },
                { value: "BL", label: "7. BL" },
                { value: "CHECKLIST", label: "8. CHECKLIST" },
                { value: "LINE INVOICE", label: "9. LINE INVOICE" },
                { value: "BOE", label: "10. BOE" },
                { value: "E-WAY BILL", label: "11. E-WAY BILL" },
                { value: "CHA PHOTO FILE", label: "12. CHA PHOTO FILE" },
                { value: "Other", label: "Other" },
              ]}
            />

            <div className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Select File</span>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none transition-all focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default DocumentsPage;
