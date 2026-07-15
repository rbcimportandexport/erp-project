const fs = require("fs");
const path = require("path");
const Document = require("../models/Document");
const Container = require("../models/Container");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { writeActivityLog } = require("../middleware/activityLog");
const parseInvoicePackingListText = require("../utils/parseInvoicePackingList");

exports.upload = async (req, res) => {
  try {
    const container = await Container.findById(req.params.containerId);
    if (!container) return errorResponse(res, "Container not found", "Record not found", 404);
    if (!req.file) return errorResponse(res, "File is required", "Please upload a document", 400);

    const document = await Document.create({
      container: container._id,
      docType: req.body.docType || "Other",
      fileName: req.file.originalname,
      filePath: `/uploads/documents/${req.file.filename}`,
      uploadedBy: req.user._id,
    });

    await writeActivityLog({ req, action: "upload", module: "Document", recordId: document._id, description: `${document.docType} uploaded` });
    return successResponse(res, document, "Document uploaded", 201);
  } catch (error) {
    return errorResponse(res, error.message, "Unable to upload document", 400);
  }
};

exports.listByContainer = async (req, res) => {
  try {
    const documents = await Document.find({ container: req.params.containerId }).populate("uploadedBy", "name email").sort("-uploadedAt");
    return successResponse(res, documents, "Documents fetched");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to fetch documents", 500);
  }
};

exports.remove = async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) return errorResponse(res, "Document not found", "Record not found", 404);

    const fullPath = path.join(__dirname, "..", document.filePath.replace(/^\/uploads\/documents\//, "uploads/documents/"));
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    await writeActivityLog({ req, action: "delete", module: "Document", recordId: document._id, description: "Document deleted" });
    return successResponse(res, document, "Document deleted");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to delete document", 400);
  }
};

exports.parseInvoicePackingList = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, "PDF file is required", "Please upload invoice or packing list PDF", 400);
    if (req.file.mimetype !== "application/pdf") {
      return errorResponse(res, "Only PDF files are supported for parsing", "Upload a PDF file", 400);
    }

    const pdfParse = require("pdf-parse");
    const buffer = fs.readFileSync(req.file.path);
    const parsedPdf = await pdfParse(buffer);
    const extracted = parseInvoicePackingListText(parsedPdf.text || "");

    await writeActivityLog({
      req,
      action: "parse",
      module: "Document",
      description: `Invoice/Packing List parsed: ${req.file.originalname}`,
    });

    return successResponse(res, extracted, "PDF parsed successfully");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to parse PDF", 400);
  }
};

exports.listAll = async (req, res) => {
  try {
    const documents = await Document.find({}).populate("container", "containerNo").populate("uploadedBy", "name email").sort("-uploadedAt");
    return successResponse(res, documents, "All documents fetched");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to fetch all documents", 500);
  }
};
