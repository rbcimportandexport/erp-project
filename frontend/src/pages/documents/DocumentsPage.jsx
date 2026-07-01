import { useState } from "react";
import { deleteDocument, getDocuments, parseInvoicePackingList, uploadDocument } from "../../api/documentApi";
import Button from "../../components/common/Button";
import FileUpload from "../../components/common/FileUpload";
import Input from "../../components/common/Input";
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
  const [preview, setPreview] = useState("");
  const [parsing, setParsing] = useState(false);
  const alert = useAlert();

  const load = async () => {
    if (!containerId) return;
    const response = await getDocuments(containerId);
    setDocuments(response.data || []);
  };

  const upload = async () => {
    if (!file || !containerId) return alert.error("Container ID and file are required");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", docType);
    await uploadDocument(containerId, formData);
    alert.success("Document uploaded");
    setFile(null);
    load();
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
      <div className="mb-5 grid gap-4 rounded-md bg-white p-5 shadow-sm md:grid-cols-4">
        <Input label="Container ID" value={containerId} onChange={(event) => setContainerId(event.target.value)} />
        <Select label="Document Type" value={docType} onChange={(event) => setDocType(event.target.value)} options={docTypes} />
        <div className="md:col-span-2"><FileUpload onChange={setFile} label={file?.name || "Choose PDF or image"} /></div>
        <Button onClick={load} variant="secondary">Load</Button>
        <Button onClick={upload}>Upload</Button>
      </div>
      <Table columns={[
        { header: "Type", accessorKey: "docType" },
        { header: "File", accessorKey: "fileName" },
        { header: "Actions", cell: ({ row }) => <div className="flex gap-2"><Button variant="secondary" onClick={() => setPreview(row.original.filePath)}>Preview</Button><Button variant="danger" onClick={async () => { await deleteDocument(row.original._id); load(); }}>Delete</Button></div> },
      ]} data={documents} />
      {preview && <div className="mt-5 rounded-md bg-white p-5 shadow-sm"><Button variant="secondary" onClick={() => setPreview("")}>Close preview</Button><div className="mt-4"><PdfPreview path={preview} /></div></div>}
    </>
  );
};

export default DocumentsPage;
