const cleanText = (text) => text.replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim();

const normalizeCode = (value) => value.replace(/\s+/g, "");

const firstMatch = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim().replace(/\s+/g, " ");
  }
  return "";
};

const getLines = (text) => cleanText(text).split("\n").map((line) => line.trim()).filter(Boolean);

const getLineValue = (lines, label) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escaped}\\s*[:\\-]?\\s*(.+)$`, "i");
  const line = lines.find((item) => pattern.test(item));
  return line?.match(pattern)?.[1]?.trim() || "";
};

const extractExporter = (lines) => {
  const start = lines.findIndex((line) => /^exporter\s*:/i.test(line));
  if (start === -1) return "";

  const values = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^(packing list|commercial invoice|date:|from:|sr no\.|to:|quantity|cbm|importer:)/i.test(line)) break;
    if (/^\d+$/.test(line)) continue;
    values.push(line);
  }

  return values.join(", ");
};

const extractImporter = (text, lines) => {
  const invoiceLineMatch = text.match(/\n([A-Z0-9 .,&()/-]{3,120}?)\s+Commercial Invoice\s*[:\-]/i);
  const name = invoiceLineMatch?.[1]?.trim().replace(/\s+/g, " ");

  const addressLines = lines.filter((line) =>
    /(?:SURAT|GUJARAT|INDIA|SARSWATI|A\.K\.ROAD|ROOPSAGAR|FIRST FLOOR)/i.test(line)
    && !/^(from|to)\s*:/i.test(line)
  );

  return [name, ...addressLines].filter(Boolean).join(", ");
};

const extractItems = (lines) => {
  const itemLines = lines.filter((line) => /^\d+[A-Z]/i.test(line));

  return itemLines.map((line) => {
    const srNo = line.match(/^(\d+)/)?.[1] || "";
    const body = line.replace(/^\d+/, "");
    const description = body
      .replace(/\s*\d+\s*(?:PCS|SET|KGS?|CTN|BOX|NOS?).*$/i, "")
      .replace(/\s+\d{2,}.*$/, "")
      .trim();

    const unit = body.match(/\d+\s*(PCS|SET|KGS?|CTN|BOX|NOS?)/i)?.[1] || "";
    const numbers = body.match(/\d+(?:\.\d+)?/g) || [];

    return {
      srNo,
      description,
      unit: unit.toUpperCase(),
      raw: line,
      numbers,
    };
  }).filter((item) => item.description);
};

const extractTotals = (lines) => {
  const totalLine = lines.find((line) => /^\d{10,}$/.test(line));
  if (!totalLine) return {};

  if (totalLine.length >= 13) {
    return {
      quantity: totalLine.slice(0, 3),
      netWeight: `${totalLine.slice(3, 8)} KGS`,
      grossWeight: `${totalLine.slice(8)} KGS`,
    };
  }

  if (totalLine.length >= 11) {
    return {
      quantity: totalLine.slice(0, 3),
      netWeight: `${totalLine.slice(3, 8)} KGS`,
      grossWeight: `${totalLine.slice(8)} KGS`,
    };
  }

  return {};
};

const extractBlockAfter = (text, labels) => {
  for (const label of labels) {
    const pattern = new RegExp(`${label}\\s*[:\\-]?\\s*([\\s\\S]{0,220}?)(?:\\n[A-Z][A-Z /]{3,}\\s*[:\\-]|\\n\\s*\\n|$)`, "i");
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim().replace(/\n/g, ", ").replace(/\s+/g, " ");
  }
  return "";
};

const parseInvoicePackingList = (rawText) => {
  const text = cleanText(rawText);
  const lines = getLines(text);
  const invoiceNo = firstMatch(text, [
    /Commercial Invoice\s*[:\-]+\s*([A-Z0-9 /._-]+)/i,
    /invoice\s*(?:no|number|#)\s*[:\-]?\s*([A-Z0-9 /._-]+)/i,
    /inv\s*(?:no|#)\s*[:\-]?\s*([A-Z0-9 /._-]+)/i,
  ]);
  const items = extractItems(lines);
  const totals = extractTotals(lines);
  const detectedDescription = firstMatch(text, [
    /description\s*(?:of goods)?\s*[:\-]?\s*([^\n]{5,160})/i,
    /goods\s*description\s*[:\-]?\s*([^\n]{5,160})/i,
    /commodity\s*[:\-]?\s*([^\n]{5,160})/i,
  ]);
  const productDescription = /^OF\s+G\s*OODS$/i.test(detectedDescription)
    ? ""
    : detectedDescription;

  return {
    documentType: firstMatch(text, [
      /\b(PROFORMA INVOICE|COMMERCIAL INVOICE|PACKING LIST|TAX INVOICE|INVOICE)\b/i,
    ]) || "Invoice / Packing List",
    invoiceNo: invoiceNo ? normalizeCode(invoiceNo) : "",
    invoiceDate: firstMatch(text, [
      /invoice\s*date\s*[:\-]?\s*([0-9]{1,2}[./-][0-9]{1,2}[./-][0-9]{2,4})/i,
      /date\s*[:\-]?\s*([0-9]{1,2}[./-][0-9]{1,2}[./-][0-9]{2,4})/i,
    ]),
    containerNo: firstMatch(text, [
      /container\s*(?:no|number|#)\s*[:\-]?\s*([A-Z]{4}\s?\d{6,7})/i,
      /\b([A-Z]{4}\s?\d{6,7})\b/,
    ]),
    blNo: firstMatch(text, [
      /\b(?:b\/l|bl|bill of lading|hbl)\s*(?:no|number|#)?\s*[:\-]?\s*([A-Z0-9/._-]+)/i,
    ]),
    hsnCode: firstMatch(text, [
      /\bhsn\s*(?:code)?\s*[:\-]?\s*(\d{4,10})/i,
      /\b(\d{8})\b/,
    ]),
    productDescription: productDescription || items.slice(0, 5).map((item) => item.description).join("; "),
    packages: firstMatch(text, [
      /(?:total\s*)?(?:packages|pkgs|cartons|ctns)\s*[:\-]?\s*([0-9,.]+\s*[A-Z]*)/i,
      /([0-9,.]+\s*(?:packages|pkgs|cartons|ctns))/i,
    ]),
    netWeight: firstMatch(text, [
      /net\s*(?:weight|wt)\s*[:\-]?\s*([0-9,.]+\s*(?:kgs?|kg|mt|tons?)?)/i,
    ]) || totals.netWeight || "",
    grossWeight: firstMatch(text, [
      /gross\s*(?:weight|wt)\s*[:\-]?\s*([0-9,.]+\s*(?:kgs?|kg|mt|tons?)?)/i,
    ]) || totals.grossWeight || "",
    quantity: firstMatch(text, [
      /quantity\s*[:\-]?\s*([0-9,.]+\s*[A-Z]*)/i,
      /\bqty\s*[:\-]?\s*([0-9,.]+\s*[A-Z]*)/i,
    ]) || totals.quantity || "",
    exporter: extractExporter(lines) || extractBlockAfter(text, ["exporter", "shipper", "seller", "consignor"]),
    importer: extractImporter(text, lines) || extractBlockAfter(text, ["importer", "consignee", "buyer"]),
    loadingPort: getLineValue(lines, "From") || firstMatch(text, [
      /(?:port of loading|loading port|pol)\s*[:\-]?\s*([^\n]{3,80})/i,
    ]),
    dischargePort: getLineValue(lines, "To") || firstMatch(text, [
      /(?:port of discharge|discharge port|pod|destination port)\s*[:\-]?\s*([^\n]{3,80})/i,
    ]),
    itemCount: items.length,
    itemsSummary: items.slice(0, 12).map((item) => `${item.srNo}. ${item.description}`).join("; "),
    rawText: text.slice(0, 5000),
  };
};

module.exports = parseInvoicePackingList;
