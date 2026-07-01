import { supabase } from "../supabaseClient";
import axiosInstance from "./axiosInstance";

export const uploadDocument = async (containerId, formData) => {
  const file = formData.get("file");
  const docType = formData.get("docType") || "Other";

  if (!file) throw new Error("No file provided");

  // 1. Upload file to Supabase storage bucket 'documents'
  const fileExt = file.name.split(".").pop();
  const fileName = `${containerId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `uploads/documents/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. Get public URL of the uploaded file
  const { data: { publicUrl } } = supabase.storage
    .from("documents")
    .getPublicUrl(filePath);

  // 3. Create a document record in database
  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        container_id: containerId,
        doc_type: docType,
        file_name: file.name,
        file_path: publicUrl,
      }
    ])
    .select()
    .single();

  if (error) throw error;

  // Map to match old response structure
  return {
    data: {
      ...data,
      _id: data.id,
      container: data.container_id,
      docType: data.doc_type,
      fileName: data.file_name,
      filePath: data.file_path,
    }
  };
};

export const getDocuments = async (containerId) => {
  const { data, error } = await supabase
    .from("documents")
    .select()
    .eq("container_id", containerId)
    .order("uploaded_at", { ascending: false });

  if (error) throw error;

  return {
    data: (data || []).map(d => ({
      ...d,
      _id: d.id,
      container: d.container_id,
      docType: d.doc_type,
      fileName: d.file_name,
      filePath: d.file_path,
    }))
  };
};

export const deleteDocument = async (id) => {
  // 1. Get the document record
  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select()
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  // Extract path from public URL
  const storagePath = doc.file_path.substring(doc.file_path.indexOf("/documents/") + 11);

  // 2. Delete from storage bucket
  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([storagePath]);

  if (storageError) console.error("Error deleting from storage:", storageError);

  // 3. Delete from database
  const { data, error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return {
    data: {
      ...data,
      _id: data.id,
    }
  };
};

// Keep pdf parsing using the backend endpoint (falls back safely if backend is down)
export const parseInvoicePackingList = (formData) =>
  axiosInstance.post("/documents/parse-invoice-packing-list", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => res.data);
