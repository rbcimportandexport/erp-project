import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { FileDown, Plus, Trash2, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import TopBar from "../../components/layout/TopBar";
import importerApi from "../../api/importerApi";
import exporterApi from "../../api/exporterApi";
import { importerAddressApi, exporterAddressApi } from "../../api/addressApi";
import { indiaPortApi, chinaPortApi } from "../../api/portApi";
import containerApi from "../../api/containerApi";
import { uploadDocument } from "../../api/documentApi";
import { useAlert } from "../../hooks/useAlert";

// ── Spell-check contenteditable input ─────────────────────────────────────────
const SpellCheckInput = ({ value, onChange, spellCheck = true }) => {
  const ref = useRef(null);
  const isFocused = useRef(false);

  useEffect(() => {
    if (!isFocused.current && ref.current) {
      if (ref.current.innerText !== value) ref.current.innerText = value ?? "";
    }
  }, [value]);

  const handleInput = useCallback(() => {
    onChange(ref.current?.innerText ?? "");
  }, [onChange]);

  return (
    <div
      ref={ref}
      contentEditable
      spellCheck={spellCheck}
      suppressContentEditableWarning
      onFocus={() => { isFocused.current = true; }}
      onBlur={() => { isFocused.current = false; }}
      onInput={handleInput}
      className="spell-check-input min-h-[38px] w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50"
    />
  );
};
// ──────────────────────────────────────────────────────────────────────────────


const emptyItem = {
  description: "",
  quantity: "",
  packages: "",
  unit: "PCS",
  netWeight: "",
  grossWeight: "",
  cbm: "",
  unitPrice: "",
  hsnCode: "",
  bcd: "",
  sws: "",
  gst: "",
};

const initialForm = {
  documentType: "PACKING LIST",
  importerName: "",
  importerAddress: "",
  exporterName: "",
  exporterAddress: "",
  invoiceNo: "",
  invoiceDate: "",
  loadingPort: "",
  dischargePort: "",
  cbm: "",
};

const toNumber = (value) => Number(String(value || "0").replace(/,/g, "")) || 0;
const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();
const isEmpty = (value) => normalizeText(value) === "";

const partyOptions = ["RBC", "Rama", "Shreeji", "Shivay"].map((value) => ({ value, label: value }));
const chaOptions = ["Ocenus", "Mountain"].map((value) => ({ value, label: value }));
const shippingLineOptions = ["HAL", "YML", "SNL", "EMC", "OOCL", "HAS", "KMTC", "MSC", "ONE", "HMM", "COSCO", "PEAK"].map((value) => ({ value, label: value }));
const portOfChinaOptions = ["NINGBO", "NANSHA", "WUHAN"].map((value) => ({ value, label: value }));
const documentProcessedOptions = ["Yes", "No", "PENDING", "Done"].map((value) => ({ value, label: value }));

const getEtaPriority = (etaValue) => {
  if (!etaValue) return { label: "No ETA", tone: "slate" };

  const parsed = dayjs(etaValue, ["DD/MM/YYYY", "DD-MM-YYYY", "DD MMM YYYY", "YYYY-MM-DD"], true);
  if (!parsed.isValid()) return { label: "ETA Set", tone: "slate" };

  const today = dayjs().startOf("day");
  const eta = parsed.startOf("day");
  const diff = eta.diff(today, "day");

  if (diff <= 7) return { label: "High Priority", tone: "red" };
  if (diff <= 15) return { label: "Medium Priority", tone: "yellow" };
  return { label: "Low Priority", tone: "green" };
};

const parseDateCell = (value) => {
  const text = normalizeText(value);
  if (!text) return "";
  const parsed = dayjs(text, ["DD/MM/YYYY", "DD-MM-YYYY", "DD.MM.YYYY", "YYYY-MM-DD", "D/M/YYYY", "DD MMM YYYY"], true);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : text;
};

const InvoiceMaker = () => {
  const documentRef = useRef(null);
  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem("invoice_maker_form");
    try {
      return saved ? JSON.parse(saved) : initialForm;
    } catch (e) {
      return initialForm;
    }
  });
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("invoice_maker_items");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("invoice_maker_form", JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    localStorage.setItem("invoice_maker_items", JSON.stringify(items));
  }, [items]);

  const handleResetForm = () => {
    if (window.confirm("Are you sure you want to clear all form fields? This cannot be undone.")) {
      setForm(initialForm);
      setItems([]);
      localStorage.removeItem("invoice_maker_form");
      localStorage.removeItem("invoice_maker_items");
      toast.success("Form cleared successfully!");
    }
  };

  const [spellingErrors, setSpellingErrors] = useState(new Set());
  const [shipmentRows, setShipmentRows] = useState([]);
  const [containersList, setContainersList] = useState([]);
  const [saving, setSaving] = useState(false);
  const toast = useAlert();

  const matchedContainer = useMemo(() => {
    const excelVal = shipmentRows.find(r => r.containerNo)?.containerNo;
    const targetNo = String(excelVal || form.invoiceNo || "").trim();
    if (!targetNo) return null;

    let match = containersList.find(c => (c.containerNo || "").toLowerCase() === targetNo.toLowerCase());
    if (match) return match;

    match = containersList.find(c => {
      const cNo = (c.containerNo || "").toLowerCase();
      const tNo = targetNo.toLowerCase();
      return cNo.includes(tNo) || tNo.includes(cNo);
    });
    return match || null;
  }, [form.invoiceNo, shipmentRows, containersList]);

  const selectedContainerId = matchedContainer?._id || matchedContainer?.id || "";

  // Master lists for dropdowns
  const [importersList, setImportersList] = useState([]);
  const [exportersList, setExportersList] = useState([]);
  const [indiaPortsList, setIndiaPortsList] = useState([]);
  const [chinaPortsList, setChinaPortsList] = useState([]);
  const [fromCountry, setFromCountry] = useState("");
  const [toCountry, setToCountry] = useState("");

  // Fetch importers, exporters, ports, and containers list on component load
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const sortByName = (a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });

        const [impRes, expRes, indPortRes, chnPortRes, contRes] = await Promise.allSettled([
          importerApi.list({ limit: 1000 }),
          exporterApi.list({ limit: 1000 }),
          indiaPortApi.list({ limit: 1000 }),
          chinaPortApi.list({ limit: 1000 }),
          containerApi.list({ limit: 1000 }),
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

        if (impRes.status === "rejected") console.error("Importer load failed:", impRes.reason);
        if (expRes.status === "rejected") console.error("Exporter load failed:", expRes.reason);
        if (indPortRes.status === "rejected") console.error("India ports load failed:", indPortRes.reason);
        if (chnPortRes.status === "rejected") console.error("China ports load failed:", chnPortRes.reason);
        if (contRes.status === "rejected") console.error("Containers load failed:", contRes.reason);
      } catch (err) {
        console.error("Error loading master datasets:", err);
      }
    };
    fetchMasters();
  }, []);

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
              updated.invoiceDate = dayjs(rawDate).format("DD/MM/YYYY");
            }
            if (!updated.loadingPort && (container.portOfChina || container.port_of_china)) {
              updated.loadingPort = container.portOfChina || container.port_of_china;
            }
            if (!updated.dischargePort && (container.portOfIndia || container.port_of_india)) {
              updated.dischargePort = container.portOfIndia || container.port_of_india;
            }
            if (!updated.cbm && container.cbm) {
              updated.cbm = String(container.cbm);
            }
            if (!updated.party && container.party) {
              updated.party = container.party;
            }
            if (!updated.cha && container.cha) {
              updated.cha = container.cha;
            }
            if (!updated.shippingLine && (container.shippingLine || container.shipping_line)) {
              updated.shippingLine = container.shippingLine || container.shipping_line;
            }
            if (!updated.portOfChina && (container.portOfChina || container.port_of_china)) {
              updated.portOfChina = container.portOfChina || container.port_of_china;
            }
            if (!updated.documentProcessed && (container.documentProcessed || container.document_processed)) {
              updated.documentProcessed = container.documentProcessed || container.document_processed;
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

  const saveToContainer = async () => {
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
      const pdf = new jsPDF("l", "mm", "a4");
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

      const rawPdfBlob = pdf.output("blob");
      const pdfBlob = new Blob([rawPdfBlob], { type: "application/pdf" });
      const docTypeLabel = form.documentType === "PACKING LIST" ? "Packing_List" : "Commercial_Invoice";

      const formData = new FormData();
      formData.append("file", pdfBlob, `${docTypeLabel}_${form.invoiceNo || "Draft"}.pdf`);
      formData.append("docType", form.documentType === "PACKING LIST" ? "CPL" : "CBL");

      // Auto-create container if it starts with RBC or contains RBC and doesn't exist yet
      let finalContainerId = selectedContainerId || null;
      if (!finalContainerId) {
        const excelVal = shipmentRows.find(r => r.containerNo)?.containerNo;
        const containerNoVal = String(excelVal || form.invoiceNo || "").trim();
        if (containerNoVal && (containerNoVal.toUpperCase().startsWith("RBC") || /RBC/i.test(containerNoVal))) {
          try {
            const matchedImp = importersList.find((i) => i.name.toLowerCase() === (form.importerName || "").trim().toLowerCase());
            const matchedExp = exportersList.find((e) => e.name.toLowerCase() === (form.exporterName || "").trim().toLowerCase());
            const defaultImp = importersList.find((i) => i.name.toUpperCase() === "UNKNOWN IMPORTER");
            const defaultExp = exportersList.find((e) => e.name.toUpperCase() === "UNKNOWN EXPORTER");

            const importerId = matchedImp?._id || defaultImp?._id;
            const exporterId = matchedExp?._id || defaultExp?._id;

            const createRes = await containerApi.create({
              containerNo: containerNoVal,
              importer: importerId,
              exporter: exporterId,
              party: form.party || undefined,
              cha: form.cha || undefined,
              shippingLine: form.shippingLine || undefined,
              portOfChina: form.portOfChina || undefined,
              loadingPort: form.loadingPort || undefined,
              dischargePort: form.dischargePort || undefined,
              cbm: form.cbm || undefined,
            });
            if (createRes.data) {
              finalContainerId = createRes.data._id || createRes.data.id;
            }
          } catch (e) {
            console.error("Auto-container creation failed:", e);
          }
        }
      }

      if (!finalContainerId) {
        toast.error("Document cannot be saved. Please link to an existing container or use an Invoice Number that contains 'RBC' to automatically create one.");
        setSaving(false);
        return;
      }

      await uploadDocument(finalContainerId, formData);
      toast.success("Document saved successfully!");
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      toast.error("Failed to save document: " + serverMsg);
    } finally {
      setSaving(false);
    }
  };

  const getFromPortsOptions = () => {
    if (fromCountry === "India") return indiaPortsList;
    if (fromCountry === "China") return chinaPortsList;
    return [];
  };

  const getToPortsOptions = () => {
    if (toCountry === "India") return indiaPortsList;
    if (toCountry === "China") return chinaPortsList;
    return [];
  };

  const handleFromPortChange = (portId) => {
    if (!portId) {
      updateForm("loadingPort", "");
      return;
    }
    const currentList = getFromPortsOptions();
    const selected = currentList.find((p) => p._id === portId);
    if (selected) {
      updateForm("loadingPort", selected.name);
    }
  };

  const handleToPortChange = (portId) => {
    if (!portId) {
      updateForm("dischargePort", "");
      return;
    }
    const currentList = getToPortsOptions();
    const selected = currentList.find((p) => p._id === portId);
    if (selected) {
      updateForm("dischargePort", selected.name);
    }
  };

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
          // Prefer default address, otherwise use the first one
          const addr = addresses.find((a) => a.isDefault) || addresses[0];
          updateForm("importerAddress", addr.addressLine1 || addr.address_line1 || "");
        } else {
          updateForm("importerAddress", "");
        }
    } catch (err) {
      console.error("Error fetching importer address details:", err);
      updateForm("importerAddress", "");
    }
  };

  const handleExporterChange = async (exporterId) => {
    if (!exporterId) {
      updateForm("exporterName", "");
      updateForm("exporterAddress", "");
      return;
    }
    const selected = exportersList.find((e) => e._id === exporterId);
    if (!selected) return;

    updateForm("exporterName", selected.name);

      try {
        const addrRes = await exporterAddressApi.list({ exporter: exporterId, limit: 10 });
        const addresses = addrRes.data?.items || [];
        if (addresses.length > 0) {
          const addr = addresses[0];
          updateForm("exporterAddress", addr.addressLine1 || addr.address_line1 || "");
        } else {
          updateForm("exporterAddress", "");
        }
    } catch (err) {
      console.error("Error fetching exporter address details:", err);
      updateForm("exporterAddress", "");
    }
  };

  // Debounced effect to check spelling across all items in a single API call
  useEffect(() => {
    const timer = setTimeout(() => {
      if (items.length === 0) {
        setSpellingErrors(new Set());
        return;
      }

      const descriptions = items.map((item) => item.description || "");
      const joinedText = descriptions.join("\n");

      if (!joinedText.trim()) {
        setSpellingErrors(new Set());
        return;
      }

      // Calculate the start character index for each description in the joined text
      const startIndices = [];
      let currentLength = 0;
      for (let i = 0; i < descriptions.length; i++) {
        startIndices.push(currentLength);
        currentLength += descriptions[i].length + 1; // +1 for the newline delimiter
      }

      const fetchCheck = async () => {
        try {
          const params = new URLSearchParams({ text: joinedText, language: "en-US" });
          const resp = await fetch("https://api.languagetool.org/v2/check", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
          });
          if (!resp.ok) return;
          const { matches } = await resp.json();

          const newErrors = new Set();
          matches.forEach((m) => {
            if (m.rule?.issueType === "misspelling") {
              const offset = m.offset;
              // Find which item index this spelling error offset belongs to
              for (let i = 0; i < startIndices.length; i++) {
                const start = startIndices[i];
                const end = i < startIndices.length - 1 ? startIndices[i + 1] : currentLength;
                if (offset >= start && offset < end) {
                  newErrors.add(i);
                  break;
                }
              }
            }
          });
          setSpellingErrors(newErrors);
        } catch (err) {
          console.error("LanguageTool spell check error:", err);
        }
      };

      fetchCheck();
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [items]);

  const totals = useMemo(
    () => items.reduce(
      (acc, item) => ({
        quantity: acc.quantity + toNumber(item.quantity),
        packages: acc.packages + toNumber(item.packages),
        netWeight: acc.netWeight + toNumber(item.netWeight),
        grossWeight: acc.grossWeight + toNumber(item.grossWeight),
        cbm: acc.cbm + toNumber(item.cbm),
        usdAmount: acc.usdAmount + (toNumber(item.quantity) * toNumber(item.unitPrice)),
      }),
      { quantity: 0, packages: 0, netWeight: 0, grossWeight: 0, cbm: 0, usdAmount: 0 }
    ),
    [items]
  );

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
            updated.invoiceDate = `${day}/${month}/${year}`;
          }
        }
      }
      return updated;
    });
  };
  const updateItem = (index, field, value) => {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)));
  };
  const addItem = () => setItems((current) => [...current, emptyItem]);
  const removeItem = (index) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));

  const fileInputRef = useRef(null);

  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        // Helper: get cell value by column letter + row number
        const cellVal = (col, row) => {
          const cellAddr = col + row;
          const cell = sheet[cellAddr];
          if (!cell) return "";
          return String(cell.v ?? "").trim();
        };

        // Helper: convert column letter(s) to 0-based index
        const letterToIdx = (letters) => {
          let idx = 0;
          for (const ch of letters.toUpperCase()) {
            idx = idx * 26 + (ch.charCodeAt(0) - 64);
          }
          return idx - 1;
        };

        // Helper: convert 0-based index to column letters
        const idxToLetter = (idx) => {
          let letters = "";
          idx += 1;
          while (idx > 0) {
            const rem = (idx - 1) % 26;
            letters = String.fromCharCode(65 + rem) + letters;
            idx = Math.floor((idx - 1) / 26);
          }
          return letters;
        };

        // Scan header row (first 5 rows) to build column-letter → header-name map
        const ref = sheet["!ref"];
        if (!ref) { alert("❌ Sheet empty hai."); return; }
        const range = XLSX.utils.decode_range(ref);
        const totalCols = range.e.c + 1;

        let headerRow = -1;
        const colLetterMap = {}; // "ENGLISH DESCRIPTION" → "G"

        for (let r = range.s.r; r <= Math.min(range.s.r + 4, range.e.r); r++) {
          let foundDesc = false, foundQty = false;
          const tempMap = {};

          for (let c = range.s.c; c < totalCols; c++) {
            const letter = idxToLetter(c);
            const val = cellVal(letter, r + 1).toUpperCase();
            if (val) {
              tempMap[val] = letter;
              if (val.includes("ENGLISH DESCRIPTION") || val.includes("DESCRITPION") || val.includes("DESCRIPTION")) foundDesc = true;
              if (val === "T-QTY" || val === "CARTON") foundQty = true;
            }
          }

          if (foundDesc && foundQty) {
            headerRow = r + 1; // 1-based row number of header
            Object.assign(colLetterMap, tempMap);
            break;
          }
        }

        if (headerRow === -1) {
          // fallback for shipment-style sheets
          headerRow = range.s.r + 1;
        }

        // Find specific column letters
        const findCol = (...keys) => {
          for (const k of keys) {
            const match = Object.keys(colLetterMap).find((h) => h.includes(k));
            if (match) return colLetterMap[match];
          }
          return null;
        };

        const descCol    = findCol("DESCRITPION (ANSHU)", "DESCRITPION", "DESCRIPTION (ANSHU)") || findCol("ENGLISH DESCRIPTION");
        const cartonCol  = findCol("CARTON");
        const tqtyCol    = findCol("T-QTY");
        const unitCol    = findCol("UNIT");
        const tcbmCol    = findCol("T-CBM");
        const tweightCol = findCol("T-WEIGHT");
        const priceCol   = findCol("UNIT PRICE");
        const hsnCol     = findCol("HSN");
        const loadingDateCol = findCol("LOADING DATE");
        const loadingDaysCol = findCol("DAYS");
        const containerNoCol = findCol("CONTAINER NO");
        const partyCol = findCol("PARTY");
        const chaCol = findCol("CHA");
        const shippingLineCol = findCol("SHIPPING LINE");
        const portOfChinaCol = findCol("PORT OF CHINA");
        const blNoCol = findCol("BL NO", "B/L NO", "BL NUMBER");
        const etaCol = findCol("ETA");
        const etaDaysCol = findCol("DAYS");
        const statusCol = findCol("STATUS");
        const documentProcessedCol = findCol("DOCUMENT PROCESSED");

        // Parse data rows
        const parsedItems = [];
        const parsedShipmentRows = [];
        for (let r = headerRow + 1; r <= range.e.r + 1; r++) {
          const desc = descCol ? cellVal(descCol, r) : "";
          const qty = tqtyCol ? cellVal(tqtyCol, r) : "";
          const pkg = cartonCol ? cellVal(cartonCol, r) : "";
          const unit = unitCol ? cellVal(unitCol, r) : "PCS";
          const tcbm = tcbmCol ? parseFloat(cellVal(tcbmCol, r)) || "" : "";
          const tweight = tweightCol ? parseFloat(cellVal(tweightCol, r)) || "" : "";
          const price = priceCol ? cellVal(priceCol, r) : "";
          const hsn = hsnCol ? cellVal(hsnCol, r) : "";

          const loadingDate = loadingDateCol ? parseDateCell(cellVal(loadingDateCol, r)) : "";
          const loadingDays = loadingDaysCol ? cellVal(loadingDaysCol, r) : "";
          const containerNo = containerNoCol ? cellVal(containerNoCol, r) : "";
          const party = partyCol ? cellVal(partyCol, r) : "";
          const cha = chaCol ? cellVal(chaCol, r) : "";
          const shippingLine = shippingLineCol ? cellVal(shippingLineCol, r) : "";
          const portOfChina = portOfChinaCol ? cellVal(portOfChinaCol, r) : "";
          const blNo = blNoCol ? cellVal(blNoCol, r) : "";
          const etaDate = etaCol ? parseDateCell(cellVal(etaCol, r)) : "";
          const etaDays = etaDaysCol ? cellVal(etaDaysCol, r) : "";
          const status = statusCol ? cellVal(statusCol, r) : "";
          const documentProcessed = documentProcessedCol ? cellVal(documentProcessedCol, r) : "";

          const hasShipmentData = [loadingDate, loadingDays, containerNo, party, cha, shippingLine, portOfChina, blNo, etaDate, etaDays, status, documentProcessed].some((value) => !isEmpty(value));
          const hasItemData = !isEmpty(desc) || !isEmpty(qty) || !isEmpty(pkg) || !isEmpty(unit) || !isEmpty(tcbm) || !isEmpty(tweight) || !isEmpty(price) || !isEmpty(hsn);

          if (hasItemData && !isEmpty(desc)) {
            parsedItems.push({
              ...emptyItem,
              description: desc.toUpperCase(),
              quantity: String(qty),
              packages: String(pkg),
              unit: (unit || "PCS").toUpperCase(),
              netWeight: tweight !== "" ? String(tweight) : "",
              grossWeight: "",
              cbm: tcbm !== "" ? String(parseFloat(tcbm).toFixed(4)) : "",
              unitPrice: price,
              hsnCode: hsn,
            });
          }

          if (hasShipmentData) {
            const priority = getEtaPriority(etaDate);
            parsedShipmentRows.push({
              loadingDate,
              loadingDays,
              containerNo,
              party,
              cha,
              shippingLine,
              portOfChina,
              blNo,
              etaDate,
              etaDays,
              etaPriority: priority.label,
              etaTone: priority.tone,
              status,
              documentProcessed,
            });
          }
        }

        if (parsedItems.length === 0 && parsedShipmentRows.length === 0) {
          alert("❌ Koi data nahi mila. Sheet headers check karein.");
          return;
        }

        if (parsedItems.length > 0) setItems(parsedItems);
        setShipmentRows(parsedShipmentRows);
        event.target.value = "";
      } catch (err) {
        alert("❌ File parse error: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const convertToPdf = async () => {
    const target = documentRef.current;
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: target.scrollWidth,
      windowHeight: target.scrollHeight,
    });
    const imageData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
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

    const pdfBlobUrl = pdf.output("bloburl");
    window.open(pdfBlobUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <style>{`
        @keyframes spellingErrorDetected {
          from { outline: none; }
          to   { outline: none; }
        }
        @media print {
          body { background: white !important; }
          aside, header, .no-print, nav { display: none !important; }
          main { padding: 0 !important; }
          .print-sheet { box-shadow: none !important; border: none !important; margin: 0 !important; width: 100% !important; }
          .print-break { page-break-before: always; }
        }
        /* Highlight misspelled words in red using native browser spell-check */
        .spell-check-input::spelling-error {
          color: #dc2626;
          text-decoration: none;
          animation: spellingErrorDetected 1ms;
        }
        .spell-check-input:not(:focus) {
          white-space: pre-wrap;
          word-break: break-word;
        }
      `}</style>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleExcelUpload}
      />
      <TopBar
        title="Packing List Form"
        actions={
          <div className="flex gap-2 items-center">
            <Button onClick={saveToContainer} loading={saving}>
              <FileDown className="h-4 w-4" />Save Document
            </Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />Import Excel
            </Button>
            <Button onClick={convertToPdf}><FileDown className="h-4 w-4" />Convert to PDF Preview</Button>
            <Button variant="danger" onClick={handleResetForm}>Clear Form</Button>
          </div>
        }
      />

      <section className="no-print mb-5 rounded-md bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-950">Manual Details</h2>
        <div className="grid gap-4 md:grid-cols-3">
  <Select
            label="Document Type"
            value={form.documentType}
            onChange={(event) => updateForm("documentType", event.target.value)}
            options={[
              { value: "PACKING LIST", label: "Packing List" },
              { value: "COMMERCIAL INVOICE", label: "Commercial Invoice" },
            ]}
          />
          <div className="flex flex-col justify-end">
            <Input label="Invoice No" value={form.invoiceNo} onChange={(event) => updateForm("invoiceNo", event.target.value)} />
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

          {/* Importer Section */}
          <Select
            label="Load Importer"
            value=""
            onChange={(event) => handleImporterChange(event.target.value)}
            options={importersList.map((imp) => ({ value: imp._id, label: imp.name }))}
          />
          <Input label="Importer Name" value={form.importerName} onChange={(event) => updateForm("importerName", event.target.value)} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Importer Address</span>
            <textarea className="min-h-10 h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50" value={form.importerAddress} onChange={(event) => updateForm("importerAddress", event.target.value)} />
          </label>

          {/* Exporter Section */}
          <Select
            label="Load Exporter"
            value=""
            onChange={(event) => handleExporterChange(event.target.value)}
            options={exportersList.map((exp) => ({ value: exp._id, label: exp.name }))}
          />
          <Input label="Exporter Name" value={form.exporterName} onChange={(event) => updateForm("exporterName", event.target.value)} />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Exporter Address</span>
            <textarea className="min-h-10 h-10 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-50" value={form.exporterAddress} onChange={(event) => updateForm("exporterAddress", event.target.value)} />
          </label>

          <Select
            label="Party"
            value={form.party || ""}
            onChange={(event) => updateForm("party", event.target.value)}
            options={partyOptions}
          />
          <Select
            label="CHA"
            value={form.cha || ""}
            onChange={(event) => updateForm("cha", event.target.value)}
            options={chaOptions}
          />
          <Select
            label="Shipping Line"
            value={form.shippingLine || ""}
            onChange={(event) => updateForm("shippingLine", event.target.value)}
            options={shippingLineOptions}
          />
          <Select
            label="Port Of China"
            value={form.portOfChina || ""}
            onChange={(event) => updateForm("portOfChina", event.target.value)}
            options={portOfChinaOptions}
          />
          <Select
            label="Document Processed"
            value={form.documentProcessed || ""}
            onChange={(event) => updateForm("documentProcessed", event.target.value)}
            options={documentProcessedOptions}
          />

          {/* From Port Section */}
          <Select
            label="From Country"
            value={fromCountry}
            onChange={(event) => setFromCountry(event.target.value)}
            options={[
              { value: "China", label: "China" },
              { value: "India", label: "India" },
            ]}
          />
          <Select
            label="Load From Port"
            value=""
            onChange={(event) => handleFromPortChange(event.target.value)}
            options={getFromPortsOptions().map((p) => ({ value: p._id, label: p.name }))}
            disabled={!fromCountry}
          />
          <Input label="From" value={form.loadingPort} onChange={(event) => updateForm("loadingPort", event.target.value)} />

          {/* To Port Section */}
          <Select
            label="To Country"
            value={toCountry}
            onChange={(event) => setToCountry(event.target.value)}
            options={[
              { value: "India", label: "India" },
              { value: "China", label: "China" },
            ]}
          />
          <Select
            label="Load To Port"
            value=""
            onChange={(event) => handleToPortChange(event.target.value)}
            options={getToPortsOptions().map((p) => ({ value: p._id, label: p.name }))}
            disabled={!toCountry}
          />
          <Input label="To" value={form.dischargePort} onChange={(event) => updateForm("dischargePort", event.target.value)} />

          {/* CBM row */}
          {form.documentType !== "COMMERCIAL INVOICE" ? (
            <Input label="CBM" value={form.cbm} onChange={(event) => updateForm("cbm", event.target.value)} />
          ) : (
            <div className="hidden md:block" />
          )}
          <div className="hidden md:block" />
          <div className="hidden md:block" />
        </div>
      </section>

      {shipmentRows.length > 0 && (
        <section className="no-print mb-5 rounded-md bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Shipment Data</h2>
              <p className="text-sm text-slate-500">Excel se aayi hui sari important fields aur ETA priority.</p>
            </div>
            <div className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
              Rows: {shipmentRows.length}
            </div>
          </div>
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left">Loading Date</th>
                  <th className="px-3 py-2 text-left">Container No</th>
                  <th className="px-3 py-2 text-left">Days</th>
                  <th className="px-3 py-2 text-left">Party</th>
                  <th className="px-3 py-2 text-left">CHA</th>
                  <th className="px-3 py-2 text-left">Shipping Line</th>
                  <th className="px-3 py-2 text-left">Port Of China</th>
                  <th className="px-3 py-2 text-left">BL No</th>
                  <th className="px-3 py-2 text-left">ETA</th>
                  <th className="px-3 py-2 text-left">Priority</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Document Processed</th>
                </tr>
              </thead>
              <tbody>
                {shipmentRows.map((row, index) => (
                  <tr key={`${row.containerNo || "row"}-${index}`} className="border-t border-slate-100">
                    <td className="px-3 py-2">{row.loadingDate || "-"}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{row.containerNo || "-"}</td>
                    <td className="px-3 py-2">{row.loadingDays || "-"}</td>
                    <td className="px-3 py-2">{row.party || "-"}</td>
                    <td className="px-3 py-2">{row.cha || "-"}</td>
                    <td className="px-3 py-2">{row.shippingLine || "-"}</td>
                    <td className="px-3 py-2">{row.portOfChina || "-"}</td>
                    <td className="px-3 py-2">{row.blNo || "-"}</td>
                    <td className="px-3 py-2">{row.etaDate || "-"}</td>
                    <td className="px-3 py-2">{row.etaDays || "-"}</td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        row.etaTone === "red"
                          ? "bg-red-100 text-red-700"
                          : row.etaTone === "yellow"
                            ? "bg-yellow-100 text-yellow-700"
                            : row.etaTone === "green"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-700"
                      }`}>
                        {row.etaPriority}
                      </span>
                    </td>
                    <td className="px-3 py-2">{row.status || "-"}</td>
                    <td className="px-3 py-2">{row.documentProcessed || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="no-print mb-5 rounded-md bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">Items</h2>
          <Button onClick={addItem}><Plus className="h-4 w-4" />Add Item</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600">
                <th className="px-3 py-2 w-[60px] text-center">Sr. No.</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Qty</th>
                {form.documentType !== "COMMERCIAL INVOICE" && <th className="px-3 py-2">Pkg</th>}
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">N.W.</th>
                {form.documentType !== "COMMERCIAL INVOICE" && <th className="px-3 py-2">G.W.</th>}
                {form.documentType !== "COMMERCIAL INVOICE" && <th className="px-3 py-2">CBM</th>}
                {form.documentType === "COMMERCIAL INVOICE" && (
                  <>
                    <th className="px-3 py-2">Unit Price</th>
                    <th className="px-3 py-2">HSN</th>
                    <th className="px-3 py-2">BCD</th>
                    <th className="px-3 py-2">SWS</th>
                    <th className="px-3 py-2">GST</th>
                  </>
                )}
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="px-3 py-2 text-center font-medium text-slate-500 align-middle">{index + 1}</td>
                  <td className="px-3 py-2 min-w-[240px] align-middle">
                    <div className="flex flex-col gap-1">
                      <SpellCheckInput
                        value={item.description}
                        onChange={(val) => updateItem(index, "description", val)}
                        spellCheck={!item.ignoreSpelling}
                      />
                      {spellingErrors.has(index) && (
                        <button
                          type="button"
                          onClick={() => updateItem(index, "ignoreSpelling", !item.ignoreSpelling)}
                          className={`w-max rounded px-2 py-0.5 text-[10px] font-semibold transition-all ${
                            item.ignoreSpelling
                              ? "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300"
                              : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                          }`}
                        >
                          {item.ignoreSpelling ? "✓ Custom Name Approved" : "⚠️ Ignore Spelling Error?"}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle"><Input value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} /></td>
                  {form.documentType !== "COMMERCIAL INVOICE" && (
                    <td className="px-3 py-2 align-middle"><Input value={item.packages} onChange={(event) => updateItem(index, "packages", event.target.value)} /></td>
                  )}
                  <td className="px-3 py-2 align-middle"><Input value={item.unit} onChange={(event) => updateItem(index, "unit", event.target.value)} /></td>
                  <td className="px-3 py-2 align-middle"><Input value={item.netWeight} onChange={(event) => updateItem(index, "netWeight", event.target.value)} /></td>
                  {form.documentType !== "COMMERCIAL INVOICE" && (
                    <td className="px-3 py-2 align-middle"><Input value={item.grossWeight} onChange={(event) => updateItem(index, "grossWeight", event.target.value)} /></td>
                  )}
                  {form.documentType !== "COMMERCIAL INVOICE" && (
                    <td className="px-3 py-2 align-middle"><Input value={item.cbm} onChange={(event) => updateItem(index, "cbm", event.target.value)} /></td>
                  )}
                  {form.documentType === "COMMERCIAL INVOICE" && (
                    <>
                      <td className="px-3 py-2 align-middle"><Input value={item.unitPrice || ""} onChange={(event) => updateItem(index, "unitPrice", event.target.value)} /></td>
                      <td className="px-3 py-2 align-middle"><Input value={item.hsnCode || ""} onChange={(event) => updateItem(index, "hsnCode", event.target.value)} /></td>
                      <td className="px-3 py-2 align-middle"><Input value={item.bcd || ""} onChange={(event) => updateItem(index, "bcd", event.target.value)} /></td>
                      <td className="px-3 py-2 align-middle"><Input value={item.sws || ""} onChange={(event) => updateItem(index, "sws", event.target.value)} /></td>
                      <td className="px-3 py-2 align-middle"><Input value={item.gst || ""} onChange={(event) => updateItem(index, "gst", event.target.value)} /></td>
                    </>
                  )}
                  <td className="px-3 py-2 align-middle text-center">
                    <Button variant="danger" className="h-10 w-10 p-0 flex items-center justify-center mx-auto hover:bg-red-700 active:scale-95 transition-all" onClick={() => removeItem(index)}>
                      <Trash2 className="h-5 w-5 shrink-0" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="print-sheet rounded-md bg-white p-6 shadow-sm">
        <div className="no-print mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">PDF Style Preview</h2>
            <p className="text-sm text-slate-500">This preview is what will open when you click Convert to PDF.</p>
          </div>
          <Button onClick={convertToPdf}><FileDown className="h-4 w-4" />Convert to PDF Preview</Button>
        </div>
        <div ref={documentRef} className="mx-auto w-[1120px] bg-white p-0 text-black">
          <table className="w-[1120px] table-fixed border-collapse border-2 border-black text-[10px] font-bold leading-[18px]">
            {form.documentType === "COMMERCIAL INVOICE" ? (
              <colgroup>
                <col className="w-[80px]" />
                <col className="w-[390px]" />
                <col className="w-[70px]" />
                <col className="w-[50px]" />
                <col className="w-[70px]" />
                <col className="w-[90px]" />
                <col className="w-[110px]" />
                <col className="w-[110px]" />
                <col className="w-[50px]" />
                <col className="w-[50px]" />
                <col className="w-[50px]" />
              </colgroup>
            ) : (
              <colgroup>
                <col className="w-[80px]" />
                <col className="w-[410px]" />
                <col className="w-[80px]" />
                <col className="w-[80px]" />
                <col className="w-[80px]" />
                <col className="w-[90px]" />
                <col className="w-[90px]" />
                <col className="w-[210px]" />
              </colgroup>
            )}
            <tbody>
              <tr>
                <td colSpan={form.documentType === "COMMERCIAL INVOICE" ? 11 : 8} className="border-2 border-black px-2 py-3 text-center font-serif text-[24px] font-black uppercase leading-[34px]">
                  {form.exporterName}
                </td>
              </tr>
              <tr>
                <td colSpan={form.documentType === "COMMERCIAL INVOICE" ? 11 : 8} className="border-2 border-black px-2 py-1 text-center text-[10px] uppercase leading-[18px]">
                  {form.exporterAddress}
                </td>
              </tr>
              <tr>
                <td colSpan={form.documentType === "COMMERCIAL INVOICE" ? 11 : 8} className="border-2 border-black px-2 py-3 text-center font-serif text-[20px] font-black uppercase leading-[30px]">
                  {form.documentType}
                </td>
              </tr>
              <tr>
                <td className="border-2 border-black px-1 py-1 align-middle">Importer:</td>
                <td colSpan={form.documentType === "COMMERCIAL INVOICE" ? 4 : 3} className="border-2 border-black px-1 py-1 align-middle uppercase">{form.importerName}</td>
                <td colSpan={form.documentType === "COMMERCIAL INVOICE" ? 6 : 4} className="border-2 border-black px-1 py-1 align-middle">Commercial Invoice :-{form.invoiceNo}</td>
              </tr>
              <tr>
                <td className="border-2 border-black px-1 py-1 align-middle">Add:</td>
                <td colSpan={form.documentType === "COMMERCIAL INVOICE" ? 4 : 3} className="border-2 border-black px-1 py-1 align-middle uppercase">{form.importerAddress}</td>
                <td colSpan={form.documentType === "COMMERCIAL INVOICE" ? 6 : 4} className="border-2 border-black px-1 py-1 align-middle">Date:{form.invoiceDate}</td>
              </tr>
              <tr>
                <td className="border-2 border-black px-1 py-1 align-middle">Exporter:</td>
                <td colSpan={form.documentType === "COMMERCIAL INVOICE" ? 4 : 3} className="border-2 border-black px-1 py-1 align-middle uppercase">{form.exporterName}</td>
                <td colSpan={form.documentType === "COMMERCIAL INVOICE" ? 6 : 4} className="border-2 border-black px-1 py-1 align-middle">From:{form.loadingPort}</td>
              </tr>
              <tr>
                <td className="border-2 border-black px-1 py-1 align-middle">Add:</td>
                <td colSpan={form.documentType === "COMMERCIAL INVOICE" ? 4 : 3} className="border-2 border-black px-1 py-1 align-middle uppercase">{form.exporterAddress}</td>
                <td colSpan={form.documentType === "COMMERCIAL INVOICE" ? 6 : 4} className="border-2 border-black px-1 py-1 align-middle">To:{form.dischargePort}</td>
              </tr>
              {form.documentType === "COMMERCIAL INVOICE" ? (
                <>
                  <tr>
                    <td rowSpan="2" className="border-2 border-black px-1 py-2 text-center align-middle">SR NO.</td>
                    <td rowSpan="2" className="border-2 border-black px-1 py-2 text-center align-middle">DESCRIPTION OF GOODS</td>
                    <td colSpan="2" className="border-2 border-black px-1 py-1 text-center">Quantity</td>
                    <td rowSpan="2" className="border-2 border-black px-1 py-2 text-center align-middle">N.W</td>
                    <td className="border-2 border-black px-1 py-1 text-center">Unit Price</td>
                    <td rowSpan="2" className="border-2 border-black px-1 py-2 text-center align-middle">USD Amount</td>
                    <td rowSpan="2" className="border-2 border-black px-1 py-2 text-center align-middle">HSN CODE</td>
                    <td rowSpan="2" className="border-2 border-black px-1 py-2 text-center align-middle">BCD</td>
                    <td rowSpan="2" className="border-2 border-black px-1 py-2 text-center align-middle">SWS</td>
                    <td rowSpan="2" className="border-2 border-black px-1 py-2 text-center align-middle">GST</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-black px-1 py-1 text-center">Qty</td>
                    <td className="border-2 border-black px-1 py-1 text-center">Unit</td>
                    <td className="border-2 border-black px-1 py-1 text-center text-[8px]">{form.dischargePort ? `CIF ${form.dischargePort.split(",")[0]}` : "CIF"}</td>
                  </tr>
                  {items.map((item, index) => {
                    const qty = toNumber(item.quantity);
                    const price = toNumber(item.unitPrice);
                    const usdAmount = qty * price;
                    return (
                      <tr key={index} className="h-[28px]">
                        <td className="border-2 border-black px-1 py-1 text-center align-middle">{index + 1}</td>
                        <td className={`border-2 border-black px-1 py-1 text-center align-middle uppercase ${spellingErrors.has(index) && !item.ignoreSpelling ? "text-red-600" : ""}`}>{item.description}</td>
                        <td className="border-2 border-black px-1 py-1 text-center align-middle">{item.quantity}</td>
                        <td className="border-2 border-black px-1 py-1 text-center align-middle uppercase">{item.unit}</td>
                        <td className="border-2 border-black px-1 py-1 text-center align-middle">{item.netWeight}</td>
                        <td className="border-2 border-black px-1 py-1 text-center align-middle">{item.unitPrice || ""}</td>
                        <td className="border-2 border-black px-1 py-1 text-center align-middle">{usdAmount ? usdAmount.toFixed(2).replace(/\.00$/, "") : ""}</td>
                        <td className="border-2 border-black px-1 py-1 text-center align-middle">{item.hsnCode || ""}</td>
                        <td className="border-2 border-black px-1 py-1 text-center align-middle">{item.bcd || ""}</td>
                        <td className="border-2 border-black px-1 py-1 text-center align-middle">{item.sws || ""}</td>
                        <td className="border-2 border-black px-1 py-1 text-center align-middle">{item.gst || ""}</td>
                      </tr>
                    );
                  })}
                  <tr className="h-[28px] font-bold">
                    <td className="border-2 border-black px-1 py-1 text-center"></td>
                    <td className="border-2 border-black px-1 py-1 text-center"></td>
                    <td className="border-2 border-black px-1 py-1 text-center"></td>
                    <td className="border-2 border-black px-1 py-1 text-center"></td>
                    <td className="border-2 border-black px-1 py-1 text-center">{totals.netWeight || ""}</td>
                    <td className="border-2 border-black px-1 py-1 text-center"></td>
                    <td className="border-2 border-black px-1 py-1 text-center">{totals.usdAmount ? totals.usdAmount.toFixed(2).replace(/\.00$/, "") : ""}</td>
                    <td className="border-2 border-black px-1 py-1 text-center"></td>
                    <td className="border-2 border-black px-1 py-1 text-center"></td>
                    <td className="border-2 border-black px-1 py-1 text-center"></td>
                    <td className="border-2 border-black px-1 py-1 text-center"></td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <td rowSpan="2" className="border-2 border-black px-1 py-2 text-center align-middle">SR NO.</td>
                    <td rowSpan="2" className="border-2 border-black px-1 py-2 text-center align-middle">DESCRIPTION OF GOODS</td>
                    <td colSpan="3" className="border-2 border-black px-1 py-1 text-center">QUANTITY</td>
                    <td rowSpan="2" className="border-2 border-black px-1 py-2 text-center align-middle">N.W.</td>
                    <td rowSpan="2" className="border-2 border-black px-1 py-2 text-center align-middle">G.W.</td>
                    <td rowSpan="2" className="border-2 border-black px-1 py-2 text-center align-middle">CBM</td>
                  </tr>
                  <tr>
                    <td className="border-2 border-black px-1 py-1 text-center">QTY</td>
                    <td className="border-2 border-black px-1 py-1 text-center">PKG</td>
                    <td className="border-2 border-black px-1 py-1 text-center">UNIT</td>
                  </tr>
                  {items.map((item, index) => (
                    <tr key={index} className="h-[28px]">
                      <td className="border-2 border-black px-1 py-1 text-center align-middle">{index + 1}</td>
                      <td className={`border-2 border-black px-1 py-1 text-center align-middle uppercase ${spellingErrors.has(index) && !item.ignoreSpelling ? "text-red-600" : ""}`}>{item.description}</td>
                      <td className="border-2 border-black px-1 py-1 text-center align-middle">{item.quantity}</td>
                      <td className="border-2 border-black px-1 py-1 text-center align-middle">{item.packages}</td>
                      <td className="border-2 border-black px-1 py-1 text-center align-middle uppercase">{item.unit}</td>
                      <td className="border-2 border-black px-1 py-1 text-center align-middle">{item.netWeight}</td>
                      <td className="border-2 border-black px-1 py-1 text-center align-middle">{item.grossWeight}</td>
                      {index === 0 && (
                        <td rowSpan={items.length + 1} className="border-2 border-black px-1 text-center align-middle text-sm">
                          {form.cbm || totals.cbm || ""}
                        </td>
                      )}
                    </tr>
                  ))}
                  <tr className="h-[28px] font-bold">
                    <td className="border-2 border-black px-1 py-1 text-center"></td>
                    <td className="border-2 border-black px-1 py-1 text-center"></td>
                    <td className="border-2 border-black px-1 py-1 text-center"></td>
                    <td className="border-2 border-black px-1 py-1 text-center">{totals.packages || ""}</td>
                    <td className="border-2 border-black px-1 py-1 text-center"></td>
                    <td className="border-2 border-black px-1 py-1 text-center">{totals.netWeight || ""}</td>
                    <td className="border-2 border-black px-1 py-1 text-center">{totals.grossWeight || ""}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
          <div className="relative h-36 bg-[linear-gradient(#e7edf3_1px,transparent_1px),linear-gradient(90deg,#e7edf3_1px,transparent_1px)] bg-[length:64px_22px]">
          </div>
        </div>
      </section>
    </>
  );
};

export default InvoiceMaker;
