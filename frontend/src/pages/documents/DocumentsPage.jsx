import { useState, useEffect } from "react";
import { deleteDocument, getDocuments, parseInvoicePackingList, uploadDocument, getAllDocuments } from "../../api/documentApi";
import containerApi from "../../api/containerApi";
import Button from "../../components/common/Button";
import FileUpload from "../../components/common/FileUpload";
import PdfPreview from "../../components/common/PdfPreview";
import Select from "../../components/common/Select";
import Table from "../../components/common/Table";
import TopBar from "../../components/layout/TopBar";
import { useAlert } from "../../hooks/useAlert";

const docTypes = ["CPL", "CBL", "ECPL", "FECPL", "BL", "HBL", "BOE", "LinePayment", "EWayBill", "Other"].map((value) => ({ value, label: value }));

const DocumentsPage = () => {
  const [containerId, setContainerId] = useState("");
  const [docType, setDocType] = useState("CPL");
  const [file, setFile] = useState(null);
  const [parseFile, setParseFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [containers, setContainers] = useState([]);
  const [preview, setPreview] = useState("");
  const [parsing, setParsing] = useState(false);
  const alert = useAlert();

  const loadContainers = async () => {
    try {
      const response = await containerApi.list({ limit: 1000 });
      setContainers(response.data?.items || []);
    } catch (error) {
      console.error("Error loading containers", error);
    }
  };

  const loadRecentDocs = async () => {
    try {
      const response = await getAllDocuments();
      setRecentDocs(response.data || []);
    } catch (error) {
      console.error("Error loading recent documents", error);
    }
  };

  useEffect(() => {
    loadContainers();
    loadRecentDocs();
  }, []);

  const load = async (cid) => {
    const activeId = cid || containerId;
    if (!activeId) return;
    const response = await getDocuments(activeId);
    setDocuments(response.data || []);
  };

  const handleContainerChange = async (cid) => {
    setContainerId(cid);
    if (cid) {
      const response = await getDocuments(cid);
      setDocuments(response.data || []);
    } else {
      setDocuments([]);
    }
  };

  const upload = async () => {
    if (!file || !containerId) return alert.error("Container and file are required");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", docType);
    try {
      await uploadDocument(containerId, formData);
      alert.success("Document uploaded successfully");
      setFile(null);
      load(containerId);
      loadRecentDocs();
    } catch (err) {
      alert.error(err.message || "Failed to upload document");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      alert.success("Document deleted successfully");
      if (containerId) {
        load(containerId);
      }
      loadRecentDocs();
    } catch (err) {
      alert.error(err.message || "Failed to delete document");
    }
  };

  const parsePdf = async () => {
    if (!parseFile) return alert.error("Invoice or packing list PDF is required");
    setParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", parseFile);
      const response = await parseInvoicePackingList(formData);
      setParsedData(response.data);
      alert.success("PDF data extracted");
    } catch (error) {
      alert.error(error.response?.data?.message || error.message);
    } finally {
      setParsing(false);
    }
  };

  const extractedRows = parsedData
    ? Object.entries(parsedData).filter(([key]) => key !== "rawText" && key !== "documentType")
    : [];

  return (
    <>
      <TopBar title="Documents" />

      {/* Auto Read Section */}
      <section className="mb-5 rounded-md bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Auto Read Invoice / Packing List</h2>
            <p className="text-sm text-slate-500">Upload PDF and extract common shipment fields automatically.</p>
          </div>
          <Button onClick={parsePdf} loading={parsing}>Read PDF</Button>
        </div>
        <FileUpload label={parseFile?.name || "Choose invoice or packing list PDF"} accept="application/pdf" onChange={setParseFile} />
        {parsedData && (
          <div className="mt-5 overflow-x-auto rounded-md border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="w-56 bg-slate-50 px-4 py-3 font-semibold text-slate-600">Document Type</td>
                  <td className="px-4 py-3 text-slate-800">{parsedData.documentType}</td>
                </tr>
                {extractedRows.map(([key, value]) => (
                  <tr key={key}>
                    <td className="w-56 bg-slate-50 px-4 py-3 font-semibold capitalize text-slate-600">{key.replace(/([A-Z])/g, " $1")}</td>
                    <td className="px-4 py-3 text-slate-800">{value || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Upload & Select Section */}
      <div className="mb-5 grid gap-4 rounded-md bg-white p-5 shadow-sm md:grid-cols-4 items-end">
        <Select
          label="Select Container"
          value={containerId}
          onChange={(event) => handleContainerChange(event.target.value)}
          options={[
            { value: "", label: "Choose a container..." },
            ...containers.map((c) => ({
              value: c.id || c._id,
              label: c.container_no || c.containerNo || "Unnamed",
            })),
          ]}
        />
        <Select label="Document Type" value={docType} onChange={(event) => setDocType(event.target.value)} options={docTypes} />
        <div className="md:col-span-2">
          <FileUpload onChange={setFile} label={file?.name || "Choose PDF or image"} />
        </div>
        <Button onClick={upload} className="md:col-span-4 w-full">Upload Document</Button>
      </div>

      {/* Documents Table */}
      {containerId ? (
        <div className="rounded-md bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-bold text-slate-900">Documents for Selected Container</h3>
          <Table columns={[
            { header: "Type", accessorKey: "docType" },
            { header: "File", accessorKey: "fileName" },
            { header: "Actions", cell: ({ row }) => (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setPreview(row.original.filePath)}>Preview</Button>
                <Button variant="danger" onClick={() => handleDelete(row.original._id)}>Delete</Button>
              </div>
            ) },
          ]} data={documents} />
        </div>
      ) : (
        <div className="rounded-md bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-bold text-slate-900">Recent Uploaded Documents (All Containers)</h3>
          <Table columns={[
            { header: "Container No", accessorKey: "containerNo" },
            { header: "Type", accessorKey: "docType" },
            { header: "File", accessorKey: "fileName" },
            { header: "Actions", cell: ({ row }) => (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setPreview(row.original.filePath)}>Preview</Button>
                <Button variant="danger" onClick={() => handleDelete(row.original._id)}>Delete</Button>
              </div>
            ) },
          ]} data={recentDocs} />
        </div>
      )}

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
