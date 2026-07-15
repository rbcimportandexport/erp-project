import React, { useState, useEffect, useRef, useMemo } from "react";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { Plus, Trash2, Upload, FileDown, Image as ImageIcon } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import importerApi from "../../api/importerApi";
import exporterApi from "../../api/exporterApi";
import { importerAddressApi, exporterAddressApi } from "../../api/addressApi";
import { indiaPortApi, chinaPortApi } from "../../api/portApi";
import containerApi from "../../api/containerApi";
import { uploadDocument } from "../../api/documentApi";
import { useAlert } from "../../hooks/useAlert";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import TopBar from "../../components/layout/TopBar";
import hsnMaster from "../../data/hsnMaster.json";

// Helper to sanitize numeric inputs
const toNumber = (val) => {
  const num = parseFloat(String(val).replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? 0 : num;
};

// Clean contenteditable input wrapper
const SpellCheckInput = ({ value, onChange, className = "" }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={() => {
        if (ref.current) {
          onChange(ref.current.innerText);
        }
      }}
      className={`outline-none border-b border-transparent hover:border-slate-200 focus:border-brand-500 min-h-6 ${className}`}
    />
  );
};

const initialForm = {
  companyName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
  companyAddress: "ROOM 101 UNIT3 BUILDING 11, TIAOYU GARDEN DONGZHOU GARDEN JIANGDONG DISTRICT YIWU CITY ZHEJIANG",
  importerName: "",
  importerAddress: "",
  invoiceNo: "",
  invoiceDate: "",
  currency: "USD",
  exporterName: "YIWU WANYU IMPORT AND EXPORT CO.,LTD",
  loadingPort: "",
  dischargePort: "",
};

const emptyItem = {
  description: "",
  quantity: "1",
  unit: "PCS",
  netWeight: "0 kg",
  unitPrice: "0.00",
};

const QuotationMaker = () => {
  const documentRef = useRef(null);
  const fileInputRef = useRef(null);
  const stampInputRef = useRef(null);

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("quotation_maker_form");
    try {
      return saved ? JSON.parse(saved) : initialForm;
    } catch (e) {
      return initialForm;
    }
  });
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("quotation_maker_items");
    try {
      return saved ? JSON.parse(saved) : [emptyItem];
    } catch (e) {
      return [emptyItem];
    }
  });
  const [stampImg, setStampImg] = useState("");
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showManualDetails, setShowManualDetails] = useState(true);
  const [showPdfPreview, setShowPdfPreview] = useState(true);

  useEffect(() => {
    localStorage.setItem("quotation_maker_form", JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    localStorage.setItem("quotation_maker_items", JSON.stringify(items));
  }, [items]);

  const handleResetForm = () => {
    if (window.confirm("Are you sure you want to clear all quotation fields? This cannot be undone.")) {
      setForm(initialForm);
      setItems([emptyItem]);
      localStorage.removeItem("quotation_maker_form");
      localStorage.removeItem("quotation_maker_items");
      toast.success("Quotation form cleared successfully!");
    }
  };

  // Master lists
  const [importersList, setImportersList] = useState([]);
  const [exportersList, setExportersList] = useState([]);
  const [indiaPortsList, setIndiaPortsList] = useState([]);
  const [chinaPortsList, setChinaPortsList] = useState([]);
  const [containersList, setContainersList] = useState([]);

  const matchedContainer = useMemo(() => {
    const targetNo = String(form.invoiceNo || "").trim();
    if (!targetNo) return null;

    let match = containersList.find(c => (c.containerNo || "").toLowerCase() === targetNo.toLowerCase());
    if (match) return match;

    match = containersList.find(c => {
      const cNo = (c.containerNo || "").toLowerCase();
      const tNo = targetNo.toLowerCase();
      return cNo.includes(tNo) || tNo.includes(cNo);
    });
    return match || null;
  }, [form.invoiceNo, containersList]);

  const selectedContainerId = matchedContainer?._id || matchedContainer?.id || "";

  // Column width controls (%)
  const [colWidths, setColWidths] = useState({
    sr: 8,
    desc: 36,
    qty: 11,
    unit: 11,
    nw: 12,
    price: 11,
    amount: 11,
  });

  const toast = useAlert();

  // Load masters
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const sortByName = (a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });

        const [impRes, expRes, indPortRes, chnPortRes, contRes] = await Promise.allSettled([
          importerApi.list({ limit: 1000 }),
          exporterApi.list({ limit: 1000 }),
          indiaPortApi.list({ limit: 1000 }),
          chinaPortApi.list({ limit: 1000 }),
          containerApi.list({ limit: 1000, sort: "-containerSeq" }),
        ]);

        const sortedImporters = (impRes.status === "fulfilled" ? impRes.value.data?.items : [])
          .map((imp) => ({ _id: imp._id, name: imp.name }))
          .sort(sortByName);

        const sortedExporters = (expRes.status === "fulfilled" ? expRes.value.data?.items : [])
          .map((exp) => ({ _id: exp._id, name: exp.name }))
          .sort(sortByName);

        const indPorts = (indPortRes.status === "fulfilled" ? indPortRes.value.data?.items : [])
          .map((p) => ({ _id: p._id, name: p.portName || p.port_name || p.city || "" }))
          .sort(sortByName);

        const chnPorts = (chnPortRes.status === "fulfilled" ? chnPortRes.value.data?.items : [])
          .map((p) => ({ _id: p._id, name: p.portName || p.port_name || p.city || "" }))
          .sort(sortByName);

        const sortedContainers = (contRes.status === "fulfilled" ? contRes.value.data?.items : [])
          .map((c) => ({
            _id: c.id || c._id,
            containerNo: c.container_no || c.containerNo || "",
            etaDate: c.eta_date || c.etaDate || "",
            status: c.status || "",
          }))
          .sort((a, b) => a.containerNo.localeCompare(b.containerNo));

        setImportersList(sortedImporters);
        setExportersList(sortedExporters);
        setIndiaPortsList(indPorts);
        setChinaPortsList(chnPorts);
        setContainersList(sortedContainers);
      } catch (err) {
        console.error("Error loading master datasets:", err);
      }
    };
    fetchMasters();
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => {
      const updated = { ...current, [field]: value };
      if (field === "invoiceNo") {
        const match = value.match(/\d{8}/);
        if (match) {
          const dateStr = match[0];
          const year = dateStr.substring(0, 4);
          const month = dateStr.substring(4, 6);
          const day = dateStr.substring(6, 8);
          const y = parseInt(year, 10);
          const m = parseInt(month, 10);
          const d = parseInt(day, 10);
          if (y >= 2000 && y <= 2099 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
            updated.invoiceDate = `${day}-${month}-${year}`;
          }
        }
      }
      return updated;
    });
  };

  // Auto-populate container details when a container is matched
  useEffect(() => {
    if (!matchedContainer) return;

    const fetchAndPopulate = async () => {
      try {
        const res = await containerApi.get(matchedContainer._id || matchedContainer.id);
        const container = res.data;
        if (container) {
          setForm((current) => {
            const updated = { ...current };
            if (!updated.invoiceDate && (container.loadingDate || container.loading_date)) {
              const rawDate = container.loadingDate || container.loading_date;
              updated.invoiceDate = dayjs(rawDate).format("DD-MM-YYYY");
            }
            if (!updated.loadingPort && (container.portOfChina || container.port_of_china)) {
              updated.loadingPort = container.portOfChina || container.port_of_china;
            }
            if (!updated.dischargePort && (container.portOfIndia || container.port_of_india)) {
              updated.dischargePort = container.portOfIndia || container.port_of_india;
            }
            if (!updated.importerName && container.party) {
              updated.importerName = container.party;
            }
            return updated;
          });
        }
      } catch (err) {
        console.error("Error auto-populating container details:", err);
      }
    };

    fetchAndPopulate();
  }, [matchedContainer]);

  const handleImporterChange = async (importerId) => {
    if (!importerId) {
      updateForm("importerName", "");
      updateForm("importerAddress", "");
      return;
    }
    const selected = importersList.find((i) => i._id === importerId);
    if (!selected) return;

    updateForm("importerName", selected.name);
    try {
      const addrRes = await importerAddressApi.list({ importer: importerId, limit: 10 });
      const addresses = addrRes.data?.items || [];
      if (addresses.length > 0) {
        const addr = addresses[0];
        updateForm("importerAddress", addr.addressLine1 || addr.address_line1 || "");
      } else {
        updateForm("importerAddress", "");
      }
    } catch (err) {
      console.error("Error loading importer address:", err);
      updateForm("importerAddress", "");
    }
  };

  const handleExporterChange = async (exporterId) => {
    if (!exporterId) {
      updateForm("exporterName", "");
      return;
    }
    const selected = exportersList.find((e) => e._id === exporterId);
    if (selected) {
      updateForm("exporterName", selected.name);
    }
  };

  const updateItem = (index, field, value) => {
    setItems((current) => current.map((item, itemIndex) => {
      if (itemIndex === index) {
        const updated = { ...item, [field]: value };
        if (field === "description") {
          const match = hsnMaster.find(m => m.description.toUpperCase() === String(value || "").trim().toUpperCase());
          if (match) {
            updated.unit = match.unit;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const addItem = () => setItems((current) => [...current, emptyItem]);
  const removeItem = (index) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const qty = toNumber(item.quantity);
        const price = toNumber(item.unitPrice);
        const amount = qty * price;
        return {
          totalAmount: acc.totalAmount + amount,
        };
      },
      { totalAmount: 0 }
    );
  }, [items]);

  const handleStampUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setStampImg(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (rows.length < 2) {
          toast.error("Excel sheet looks empty.");
          return;
        }

        // Header mapping
        const headers = rows[0].map(h => String(h || "").trim().toLowerCase());
        const descIdx = headers.findIndex(h => h.includes("desc") || h.includes("item") || h.includes("goods"));
        const qtyIdx = headers.findIndex(h => h.includes("qty") || h.includes("quantity"));
        const unitIdx = headers.findIndex(h => h.includes("unit") && !h.includes("price"));
        const nwIdx = headers.findIndex(h => h.includes("n.w") || h.includes("net weight") || h.includes("net_weight"));
        const priceIdx = headers.findIndex(h => h.includes("price") || h.includes("rate"));

        if (descIdx === -1) {
          toast.error("Could not find Description column in Excel.");
          return;
        }

        const newItems = rows.slice(1).map(row => {
          if (!row[descIdx]) return null;
          return {
            description: String(row[descIdx] || "").trim(),
            quantity: String(row[qtyIdx] !== undefined ? row[qtyIdx] : "1"),
            unit: String(row[unitIdx] !== undefined ? row[unitIdx] : "PCS").trim().toUpperCase(),
            netWeight: String(row[nwIdx] !== undefined ? row[nwIdx] : "0 kg"),
            unitPrice: String(row[priceIdx] !== undefined ? row[priceIdx] : "0.00"),
          };
        }).filter(Boolean);

        if (newItems.length > 0) {
          setItems(newItems);
          toast.success(`Imported ${newItems.length} items successfully!`);
        } else {
          toast.error("No valid items found in the Excel sheet.");
        }
      } catch (err) {
        console.error("Excel error:", err);
        toast.error("Failed to parse Excel file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const generatePdf = async (shouldSave = false) => {
    setSaving(true);
    try {
      const target = documentRef.current;
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight,
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 5;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;

      const imageRatio = canvas.width / canvas.height;
      const pageRatio = maxWidth / maxHeight;

      const imageWidth = imageRatio > pageRatio ? maxWidth : maxHeight * imageRatio;
      const imageHeight = imageRatio > pageRatio ? maxWidth / imageRatio : maxHeight;

      const x = (pageWidth - imageWidth) / 2;
      const y = (pageHeight - imageHeight) / 2;

      pdf.addImage(imageData, "PNG", x, y, imageWidth, imageHeight);

      if (shouldSave) {
        const pdfBlob = pdf.output("blob");
        const file = new File([pdfBlob], `Quotation_${form.invoiceNo || "Draft"}.pdf`, { type: "application/pdf" });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("docType", "QUOTATION");

        // Auto-create container if it starts with RBC or contains RBC and doesn't exist yet
        let finalContainerId = selectedContainerId || null;
        if (!finalContainerId) {
          const containerNoVal = String(form.invoiceNo || "").trim();
          if (containerNoVal && (containerNoVal.toUpperCase().startsWith("RBC") || /RBC/i.test(containerNoVal))) {
            try {
              const createRes = await containerApi.create({ containerNo: containerNoVal });
              if (createRes.data) {
                finalContainerId = createRes.data._id || createRes.data.id;
              }
            } catch (e) {
              console.error("Auto-container creation failed:", e);
            }
          }
        }

        await uploadDocument(finalContainerId || null, formData);
        toast.success("Quotation saved successfully!");
      } else {
        const pdfBlobUrl = pdf.output("bloburl");
        window.open(pdfBlobUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to compile PDF: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleWidthChange = (col, value) => {
    setColWidths((prev) => ({ ...prev, [col]: Number(value) }));
  };

  return (
    <>
      <style>{`
        @media print {
          body { background: white !important; }
          aside, header, .no-print, nav { display: none !important; }
          main { padding: 0 !important; }
          .print-sheet { box-shadow: none !important; border: none !important; margin: 0 !important; width: 100% !important; }
        }
      `}</style>

      {/* Hidden inputs */}
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelUpload} />
      <input ref={stampInputRef} type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />

      <TopBar
        title="Quotation Maker"
        actions={
          <div className="flex flex-wrap gap-2 items-center">
            <Button onClick={() => generatePdf(true)} loading={saving}>
              <FileDown className="h-4 w-4" />Save Document
            </Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />Import Excel
            </Button>
            <Button onClick={() => generatePdf(false)} loading={saving}>
              <FileDown className="h-4 w-4" />Preview / Print PDF
            </Button>
            <Button variant="danger" onClick={handleResetForm}>Clear Form</Button>
          </div>
        }
      />

      {/* Manual Details Section */}
      <section className="no-print mb-5 rounded-md bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">Quotation Details</h2>
          <Button
            variant="secondary"
            onClick={() => setShowManualDetails(!showManualDetails)}
            className="text-xs py-1.5 px-3"
          >
            {showManualDetails ? "Hide Form" : "Show Form"}
          </Button>
        </div>
        {showManualDetails && (
          <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col justify-end">
            <Input label="Invoice/Quotation No" value={form.invoiceNo} onChange={(event) => updateForm("invoiceNo", event.target.value)} />
            {matchedContainer ? (
              <span className="text-xs font-semibold text-emerald-600 mt-1">
                ✓ Linked to Container: {matchedContainer.containerNo} {matchedContainer.status ? `(${matchedContainer.status})` : ""}
              </span>
            ) : (
              form.invoiceNo && /RBC/i.test(form.invoiceNo) ? (
                <span className="text-xs font-semibold text-amber-600 mt-1">
                  ⚠ Will create container: {form.invoiceNo} on save
                </span>
              ) : null
            )}
          </div>
          <Input label="Date" value={form.invoiceDate} onChange={(event) => updateForm("invoiceDate", event.target.value)} />
          <div /> {/* Spacer to maintain 3-column layout */}

          <Select
            label="Load Importer"
            value=""
            onChange={(event) => handleImporterChange(event.target.value)}
            options={[
              { value: "", label: "Load Importer..." },
              ...importersList.map((i) => ({ value: i._id, label: i.name })),
            ]}
          />
          <Input label="Importer Name" value={form.importerName} onChange={(event) => updateForm("importerName", event.target.value)} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Importer Address</span>
            <textarea
              className="min-h-10 h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50"
              value={form.importerAddress}
              onChange={(event) => updateForm("importerAddress", event.target.value)}
            />
          </label>

          <Select
            label="Load Exporter"
            value=""
            onChange={(event) => handleExporterChange(event.target.value)}
            options={[
              { value: "", label: "Load Exporter..." },
              ...exportersList.map((e) => ({ value: e._id, label: e.name })),
            ]}
          />
          <Input label="Exporter Name" value={form.exporterName} onChange={(event) => updateForm("exporterName", event.target.value)} />
          <Input label="Currency" value={form.currency} onChange={(event) => updateForm("currency", event.target.value)} />

          <Input label="From Port" value={form.loadingPort} onChange={(event) => updateForm("loadingPort", event.target.value)} />
          <Input label="To Port" value={form.dischargePort} onChange={(event) => updateForm("dischargePort", event.target.value)} />
          
          <div className="flex flex-col justify-end">
            <Button variant="secondary" onClick={() => stampInputRef.current?.click()} className="h-10">
              <ImageIcon className="h-4 w-4" /> Upload Stamp/Signature
            </Button>
          </div>
        </div>
        )}
      </section>

      {/* Dynamic Column Width Adjustments */}
      <section className="no-print mb-5 rounded-md bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Adjust Columns Widths (%)</h2>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-7">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Sr No. ({colWidths.sr}%)</label>
            <input type="range" min="3" max="15" value={colWidths.sr} onChange={e => handleWidthChange('sr', e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Description ({colWidths.desc}%)</label>
            <input type="range" min="15" max="60" value={colWidths.desc} onChange={e => handleWidthChange('desc', e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Qty ({colWidths.qty}%)</label>
            <input type="range" min="5" max="25" value={colWidths.qty} onChange={e => handleWidthChange('qty', e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Unit ({colWidths.unit}%)</label>
            <input type="range" min="5" max="25" value={colWidths.unit} onChange={e => handleWidthChange('unit', e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">N.W. ({colWidths.nw}%)</label>
            <input type="range" min="5" max="25" value={colWidths.nw} onChange={e => handleWidthChange('nw', e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Unit Price ({colWidths.price}%)</label>
            <input type="range" min="5" max="25" value={colWidths.price} onChange={e => handleWidthChange('price', e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Amount ({colWidths.amount}%)</label>
            <input type="range" min="5" max="25" value={colWidths.amount} onChange={e => handleWidthChange('amount', e.target.value)} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>
        </div>
      </section>

      {/* Items Section */}
      <section className="no-print mb-5 rounded-md bg-white p-5 shadow-sm w-full max-w-full overflow-hidden">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">Items List</h2>
          <Button onClick={addItem}><Plus className="h-4 w-4" />Add Item</Button>
        </div>
        <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600">
                <th className="px-3 py-2 w-[60px] text-center">Sr. No.</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">N.W.</th>
                <th className="px-3 py-2">Unit Price</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-center font-medium text-slate-500 align-middle">{index + 1}</td>
                  <td className="px-3 py-2 min-w-[240px] align-middle relative">
                    <Input
                      value={item.description}
                      onChange={(event) => updateItem(index, "description", event.target.value)}
                      onFocus={() => setActiveRowIndex(index)}
                      onBlur={() => {
                        setTimeout(() => setActiveRowIndex(null), 250);
                      }}
                    />
                    {activeRowIndex === index && (item.description || "").trim().length >= 2 && (() => {
                      const query = (item.description || "").trim().toLowerCase();
                      const suggestions = hsnMaster.filter(m => m.description.toLowerCase().includes(query)).slice(0, 5);
                      if (suggestions.length === 0) return null;
                      return (
                        <div className="absolute left-3 right-3 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg text-left">
                          {suggestions.map((sug) => (
                            <button
                              key={sug.description}
                              type="button"
                              onMouseDown={() => {
                                updateItem(index, "description", sug.description);
                                updateItem(index, "unit", sug.unit);
                                setActiveRowIndex(null);
                              }}
                              className="block w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                              <div className="font-bold text-slate-800">{sug.description}</div>
                              <div className="text-[10px] text-slate-500">Unit: {sug.unit} | HSN: {sug.hsn}</div>
                            </button>
                          ))}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-2 align-middle w-24">
                    <Input value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} />
                  </td>
                  <td className="px-3 py-2 align-middle w-24">
                    <Input value={item.unit} onChange={(event) => updateItem(index, "unit", event.target.value)} />
                  </td>
                  <td className="px-3 py-2 align-middle w-32">
                    <Input value={item.netWeight} onChange={(event) => updateItem(index, "netWeight", event.target.value)} />
                  </td>
                  <td className="px-3 py-2 align-middle w-36">
                    <Input value={item.unitPrice} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} />
                  </td>
                  <td className="px-3 py-2 align-middle text-center w-16">
                    <Button variant="danger" className="h-10 w-10 p-0 flex items-center justify-center mx-auto hover:bg-red-700 transition-all" onClick={() => removeItem(index)}>
                      <Trash2 className="h-5 w-5 shrink-0" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* PDF Style Preview */}
      <section className="print-sheet rounded-md bg-white p-6 shadow-sm mb-10 overflow-x-auto w-full max-w-full">
        <div className="no-print mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">PDF Style Live Preview</h2>
            <p className="text-sm text-slate-500">Is preview par click karke aap details directly change aur type bhi kar sakte hain.</p>
          </div>
          <div className="flex gap-2 items-center">
            <Button variant="secondary" onClick={() => setShowPdfPreview(!showPdfPreview)}>
              {showPdfPreview ? "Hide Preview" : "Show Preview"}
            </Button>
          </div>
        </div>

        {/* Outer container designed to match Cambria/Georgia formal business quote */}
        {showPdfPreview && (
          <div 
            ref={documentRef} 
          className="mx-auto w-[794px] min-h-[1120px] bg-white p-[34px] relative overflow-hidden text-[#17202a]"
          style={{ fontFamily: 'Cambria, Georgia, serif', borderTop: '10px solid #173b68' }}
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-[#173b68] pb-4 mb-4">
            <div className="w-[500px]">
              <h1 className="text-[26px] font-bold leading-tight text-[#173b68]">
                <SpellCheckInput value={form.companyName} onChange={val => updateForm("companyName", val)} />
              </h1>
              <p className="text-[12px] text-[#334155] font-bold mt-2 leading-relaxed">
                <SpellCheckInput value={form.companyAddress} onChange={val => updateForm("companyAddress", val)} />
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-4 py-2 bg-[#173b68] text-white font-bold text-[20px] tracking-wide">
                QUOTATION
              </span>
              <p className="text-[12px] text-[#667085] mt-1 font-semibold">Commercial offer document</p>
            </div>
          </div>

          {/* Metadata Boxes */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Importer / Bill To */}
            <div className="border border-[#d7dde7] bg-[#f5f7fb] p-3 rounded min-h-[135px] text-[13px]">
              <h2 className="font-bold text-[13px] text-[#173b68] uppercase tracking-wider mb-2" style={{ fontFamily: 'Verdana, sans-serif' }}>
                Importer / Bill To
              </h2>
              <div className="font-bold leading-snug">
                <SpellCheckInput value={form.importerName} onChange={val => updateForm("importerName", val)} className="font-bold mb-1" />
                <textarea 
                  className="w-full bg-transparent resize-none border-none outline-none font-bold text-[13px] leading-snug h-16 p-0 focus:ring-0"
                  value={form.importerAddress}
                  onChange={e => updateForm("importerAddress", e.target.value)}
                />
              </div>
            </div>

            {/* Quotation Details */}
            <div className="border border-[#d7dde7] bg-[#f5f7fb] p-3 rounded min-h-[135px] text-[13px]">
              <h2 className="font-bold text-[13px] text-[#173b68] uppercase tracking-wider mb-2" style={{ fontFamily: 'Verdana, sans-serif' }}>
                Quotation Details
              </h2>
              <table className="w-full border-none text-[13px]">
                <tbody>
                  <tr className="align-middle">
                    <td className="border-none py-0.5 text-[#667085] font-semibold w-24 pl-0" style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px' }}>Invoice No</td>
                    <td className="border-none py-0.5 font-bold pr-0"><SpellCheckInput value={form.invoiceNo} onChange={val => updateForm("invoiceNo", val)} /></td>
                  </tr>
                  <tr className="align-middle">
                    <td className="border-none py-0.5 text-[#667085] font-semibold w-24 pl-0" style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px' }}>Date</td>
                    <td className="border-none py-0.5 font-bold pr-0"><SpellCheckInput value={form.invoiceDate} onChange={val => updateForm("invoiceDate", val)} /></td>
                  </tr>
                  <tr className="align-middle">
                    <td className="border-none py-0.5 text-[#667085] font-semibold w-24 pl-0" style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px' }}>Currency</td>
                    <td className="border-none py-0.5 font-bold pr-0"><SpellCheckInput value={form.currency} onChange={val => updateForm("currency", val)} /></td>
                  </tr>
                  <tr className="align-middle">
                    <td className="border-none py-0.5 text-[#667085] font-semibold w-24 pl-0" style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px' }}>Exporter</td>
                    <td className="border-none py-0.5 font-bold pr-0"><SpellCheckInput value={form.exporterName} onChange={val => updateForm("exporterName", val)} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Route Info */}
          <div className="border border-[#d7dde7] grid grid-cols-2 mb-5 rounded bg-white overflow-hidden text-[14px]">
            <div className="p-3 border-r border-[#d7dde7] font-bold">
              <span className="block text-[#667085] text-[10px] uppercase font-bold tracking-wider mb-1" style={{ fontFamily: 'Verdana, sans-serif' }}>From</span>
              <SpellCheckInput value={form.loadingPort} onChange={val => updateForm("loadingPort", val)} />
            </div>
            <div className="p-3 font-bold">
              <span className="block text-[#667085] text-[10px] uppercase font-bold tracking-wider mb-1" style={{ fontFamily: 'Verdana, sans-serif' }}>To</span>
              <SpellCheckInput value={form.dischargePort} onChange={val => updateForm("dischargePort", val)} />
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-[#d7dde7] table-fixed text-[13px]">
            <colgroup>
              <col style={{ width: `${colWidths.sr}%` }} />
              <col style={{ width: `${colWidths.desc}%` }} />
              <col style={{ width: `${colWidths.qty}%` }} />
              <col style={{ width: `${colWidths.unit}%` }} />
              <col style={{ width: `${colWidths.nw}%` }} />
              <col style={{ width: `${colWidths.price}%` }} />
              <col style={{ width: `${colWidths.amount}%` }} />
            </colgroup>
            <thead>
              <tr className="bg-[#173b68] text-white">
                <th className="border-r border-[#d7dde7]/30 p-2 font-bold uppercase text-center" style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px' }}>Sr No.</th>
                <th className="border-r border-[#d7dde7]/30 p-2 font-bold uppercase text-left" style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px' }}>Description of Goods</th>
                <th className="border-r border-[#d7dde7]/30 p-2 font-bold uppercase text-center" style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px' }}>Qty</th>
                <th className="border-r border-[#d7dde7]/30 p-2 font-bold uppercase text-center" style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px' }}>Unit</th>
                <th className="border-r border-[#d7dde7]/30 p-2 font-bold uppercase text-center" style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px' }}>N.W.</th>
                <th className="border-r border-[#d7dde7]/30 p-2 font-bold uppercase text-right" style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px' }}>Unit Price</th>
                <th className="p-2 font-bold uppercase text-right" style={{ fontFamily: 'Verdana, sans-serif', fontSize: '11px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const qty = toNumber(item.quantity);
                const price = toNumber(item.unitPrice);
                const amount = qty * price;
                return (
                  <tr key={idx} className={idx % 2 === 1 ? "bg-[#fafbfe]" : "bg-white"}>
                    <td className="border-r border-b border-[#d7dde7] p-2 text-center align-middle font-bold">{idx + 1}</td>
                    <td className="border-r border-b border-[#d7dde7] p-2 align-middle font-bold text-left">
                      <SpellCheckInput value={item.description} onChange={val => updateItem(idx, "description", val)} />
                    </td>
                    <td className="border-r border-b border-[#d7dde7] p-2 text-center align-middle font-bold">
                      <SpellCheckInput value={item.quantity} onChange={val => updateItem(idx, "quantity", val)} />
                    </td>
                    <td className="border-r border-b border-[#d7dde7] p-2 text-center align-middle font-bold">
                      <SpellCheckInput value={item.unit} onChange={val => updateItem(idx, "unit", val)} />
                    </td>
                    <td className="border-r border-b border-[#d7dde7] p-2 text-center align-middle font-bold">
                      <SpellCheckInput value={item.netWeight} onChange={val => updateItem(idx, "netWeight", val)} />
                    </td>
                    <td className="border-r border-b border-[#d7dde7] p-2 text-right align-middle font-bold">
                      <SpellCheckInput value={item.unitPrice} onChange={val => updateItem(idx, "unitPrice", val)} />
                    </td>
                    <td className="border-b border-[#d7dde7] p-2 text-right align-middle font-bold">
                      {amount.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="flex justify-end mt-0">
            <div className="w-[300px] border border-t-0 border-[#d7dde7]">
              <div className="grid grid-cols-2 font-bold text-[14px]">
                <div className="p-2 border-r border-[#d7dde7]">Total {form.currency}</div>
                <div className="p-2 text-right font-bold">{totals.totalAmount.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-2 font-bold text-[16px] bg-[#173b68] text-white">
                <div className="p-2 border-r border-[#d7dde7]/30">Grand Total</div>
                <div className="p-2 text-right font-bold">{totals.totalAmount.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Notes and Stamp */}
          <div className="flex justify-end mt-8 items-end">
            <div className="border border-[#d7dde7] p-3 text-center w-[220px] bg-white flex flex-col items-center">
              {stampImg ? (
                <img src={stampImg} alt="Stamp and signature" className="max-w-[170px] max-h-[100px] mb-1 opacity-85 object-contain" />
              ) : (
                <div className="h-16 flex items-center justify-center text-slate-400 text-xs italic font-bold">
                  Stamp Area (Upload above)
                </div>
              )}
              <div className="w-[180px] border-t border-[#98a2b3] my-1.5"></div>
              <p className="text-[11px] text-[#667085] font-bold" style={{ fontFamily: 'Verdana, sans-serif' }}>
                Authorised Seal & Signature
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute left-[38px] right-[38px] bottom-[22px] border-t border-[#d7dde7] pt-2 text-[#667085] text-[10px] font-bold text-center" style={{ fontFamily: 'Verdana, sans-serif' }}>
            RBC Import & Export ERP System - Quotation Commercial Offer Document
          </div>
        </div>
        )}
      </section>
    </>
  );
};

export default QuotationMaker;
