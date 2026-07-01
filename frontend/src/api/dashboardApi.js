import { supabase } from "../supabaseClient";

// Helper to map DB keys
const mapKeys = (item) => {
  if (!item || typeof item !== "object") return item;
  if (Array.isArray(item)) return item.map(mapKeys);

  const mapped = { ...item };
  if (mapped.id) mapped._id = mapped.id;
  if (mapped.container_id) mapped.container = mapped.container_id;

  for (const key in mapped) {
    if (typeof mapped[key] === "object") {
      mapped[key] = mapKeys(mapped[key]);
    }
  }

  return mapped;
};

export const getStats = async () => {
  const todayStr = new Date().toISOString().split("T")[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  const [
    { count: totalContainers },
    { count: upcomingEta },
    { count: todaysTasks },
    { count: doneContainers },
    { count: pendingContainers },
    { count: pendingLinePayment },
    { data: boeDocs }
  ] = await Promise.all([
    supabase.from("containers").select("*", { count: "exact", head: true }),
    supabase.from("containers").select("*", { count: "exact", head: true }).gte("eta_date", todayStr).lte("eta_date", nextWeekStr),
    supabase.from("containers").select("*", { count: "exact", head: true }).or(`eta_date.eq.${todayStr},unloading_date.eq.${todayStr}`),
    supabase.from("containers").select("*", { count: "exact", head: true }).eq("status", "done"),
    supabase.from("containers").select("*", { count: "exact", head: true }).neq("status", "done"),
    supabase.from("payments").select("*", { count: "exact", head: true }).gt("pending_amount", 0),
    supabase.from("documents").select("container_id").eq("doc_type", "BOE")
  ]);

  const total = totalContainers || 0;
  const boeCount = boeDocs ? new Set(boeDocs.map(d => d.container_id)).size : 0;

  return {
    data: {
      totalContainers: total,
      upcomingEta: upcomingEta || 0,
      todaysTasks: todaysTasks || 0,
      doneContainers: doneContainers || 0,
      pendingContainers: pendingContainers || 0,
      pendingBoe: Math.max(total - boeCount, 0),
      pendingLinePayment: pendingLinePayment || 0,
    }
  };
};

export const getUpcomingEta = async () => {
  const todayStr = new Date().toISOString().split("T")[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("containers")
    .select("*, importer:importers(*), exporter:exporters(*)")
    .gte("eta_date", todayStr)
    .lte("eta_date", nextWeekStr)
    .order("eta_date");

  if (error) throw error;
  return { data: mapKeys(data) };
};

export const getPendingBoe = async () => {
  const { data: boeDocs } = await supabase.from("documents").select("container_id").eq("doc_type", "BOE");
  const containerIdsWithBoe = boeDocs ? boeDocs.map(d => d.container_id) : [];

  let query = supabase
    .from("containers")
    .select("*, importer:importers(*), exporter:exporters(*)")
    .order("eta_date");

  if (containerIdsWithBoe.length > 0) {
    query = query.not("id", "in", `(${containerIdsWithBoe.join(",")})`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return { data: mapKeys(data) };
};

export const getPendingLinePayment = async () => {
  const { data, error } = await supabase
    .from("payments")
    .select("*, container:containers(*, importer:importers(*), exporter:exporters(*))")
    .gt("pending_amount", 0)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return { data: mapKeys(data) };
};
