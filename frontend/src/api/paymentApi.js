import { supabase } from "../supabaseClient";

// Helper to map DB keys
const mapKeys = (item) => {
  if (!item) return null;
  const mapped = { ...item };
  if (mapped.id) {
    mapped._id = mapped.id;
  }
  if (mapped.container_id) {
    mapped.container = mapped.container_id;
  }
  return mapped;
};

// Helper to map payload keys to DB columns
const mapPayload = (payload) => {
  if (!payload) return {};
  const mapped = { ...payload };

  if ("dutyAmount" in mapped) mapped.duty_amount = mapped.dutyAmount;
  if ("cgstAmount" in mapped) mapped.cgst_amount = mapped.cgstAmount;
  if ("otherCharges" in mapped) mapped.other_charges = mapped.otherCharges;
  if ("shippingLinePayment" in mapped) mapped.shipping_line_payment = mapped.shippingLinePayment;
  if ("clientPayment" in mapped) mapped.client_payment = mapped.clientPayment;
  if ("totalAmount" in mapped) mapped.total_amount = mapped.totalAmount;
  if ("paidAmount" in mapped) mapped.paid_amount = mapped.paidAmount;
  if ("pendingAmount" in mapped) mapped.pending_amount = mapped.pendingAmount;
  if ("paymentDate" in mapped) mapped.payment_date = mapped.paymentDate;
  if ("paymentMode" in mapped) mapped.payment_mode = mapped.paymentMode;

  // recalculate totals
  const total = Number(mapped.duty_amount || 0) + 
                Number(mapped.cgst_amount || 0) + 
                Number(mapped.other_charges || 0) + 
                Number(mapped.shipping_line_payment || 0) + 
                Number(mapped.client_payment || 0);
  mapped.total_amount = total;
  mapped.pending_amount = Math.max(total - Number(mapped.paid_amount || 0), 0);

  // clean camelCase props
  delete mapped.dutyAmount;
  delete mapped.cgstAmount;
  delete mapped.otherCharges;
  delete mapped.shippingLinePayment;
  delete mapped.clientPayment;
  delete mapped.totalAmount;
  delete mapped.paidAmount;
  delete mapped.pendingAmount;
  delete mapped.paymentDate;
  delete mapped.paymentMode;
  delete mapped.createdAt;
  delete mapped.updatedAt;
  delete mapped._id;

  return mapped;
};

export const createPayment = async (containerId, payload) => {
  const mapped = mapPayload(payload);
  mapped.container_id = containerId;

  const { data, error } = await supabase
    .from("payments")
    .insert([mapped])
    .select()
    .single();

  if (error) throw error;
  return { data: mapKeys(data) };
};

export const getPayment = async (containerId) => {
  const { data, error } = await supabase
    .from("payments")
    .select()
    .eq("container_id", containerId)
    .maybeSingle();

  if (error) throw error;
  return { data: mapKeys(data) };
};

export const updatePayment = async (id, payload) => {
  const mapped = mapPayload(payload);
  const { data, error } = await supabase
    .from("payments")
    .update(mapped)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return { data: mapKeys(data) };
};
