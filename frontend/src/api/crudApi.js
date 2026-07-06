import { supabase } from "../supabaseClient";

// Helper to map DB column keys (id <-> _id)
const mapKeys = (item) => {
  if (!item || typeof item !== "object") return item;
  if (Array.isArray(item)) return item.map(mapKeys);

  const mapped = { ...item };
  if (mapped.id) {
    mapped._id = mapped.id;
  }

  if ("address_line1" in mapped && !("addressLine1" in mapped)) {
    mapped.addressLine1 = mapped.address_line1;
  }
  if ("is_default" in mapped && !("isDefault" in mapped)) {
    mapped.isDefault = mapped.is_default;
  }
  if ("port_name" in mapped && !("portName" in mapped)) {
    mapped.portName = mapped.port_name;
  }
  if ("portName" in mapped && !("port_name" in mapped)) {
    mapped.port_name = mapped.portName;
  }
  if ("container_no" in mapped && !("containerNo" in mapped)) {
    mapped.containerNo = mapped.container_no;
  }
  if ("loading_date" in mapped && !("loadingDate" in mapped)) {
    mapped.loadingDate = mapped.loading_date;
  }
  if ("eta_date" in mapped && !("etaDate" in mapped)) {
    mapped.etaDate = mapped.eta_date;
  }
  if ("unloading_date" in mapped && !("unloadingDate" in mapped)) {
    mapped.unloadingDate = mapped.unloading_date;
  }
  if ("shipping_line" in mapped && !("shippingLine" in mapped)) {
    mapped.shippingLine = mapped.shipping_line;
  }
  if ("port_of_china" in mapped && !("portOfChina" in mapped)) {
    mapped.portOfChina = mapped.port_of_china;
  }
  if ("bl_no" in mapped && !("blNo" in mapped)) {
    mapped.blNo = mapped.bl_no;
  }
  if ("document_processed" in mapped && !("documentProcessed" in mapped)) {
    mapped.documentProcessed = mapped.document_processed;
  }
  if ("loading_days" in mapped && !("loadingDays" in mapped)) {
    mapped.loadingDays = mapped.loading_days;
  }
  if ("eta_days" in mapped && !("etaDays" in mapped)) {
    mapped.etaDays = mapped.eta_days;
  }

  for (const key in mapped) {
    if (typeof mapped[key] === "object") {
      mapped[key] = mapKeys(mapped[key]);
    }
  }

  return mapped;
};

// Helper to map payload keys to fit PostgreSQL snake_case columns
const mapPayload = (payload) => {
  if (!payload || typeof payload !== "object") return payload;
  const mapped = { ...payload };

  if (mapped._id) {
    mapped.id = mapped._id;
    delete mapped._id;
  }

  if ("importer" in mapped) {
    const val = mapped.importer;
    mapped.importer_id = val && typeof val === "object" ? (val.id || val._id) : val;
    delete mapped.importer;
  }
  if ("exporter" in mapped) {
    const val = mapped.exporter;
    mapped.exporter_id = val && typeof val === "object" ? (val.id || val._id) : val;
    delete mapped.exporter;
  }
  if ("hsnCode" in mapped) {
    const val = mapped.hsnCode;
    mapped.hsn_code_id = val && typeof val === "object" ? (val.id || val._id) : val;
    delete mapped.hsnCode;
  }
  if ("containerNo" in mapped) {
    mapped.container_no = mapped.containerNo;
    delete mapped.containerNo;
  }
  if ("loadingDate" in mapped) {
    mapped.loading_date = mapped.loadingDate === "" ? null : mapped.loadingDate;
    delete mapped.loadingDate;
  }
  if ("etaDate" in mapped) {
    mapped.eta_date = mapped.etaDate === "" ? null : mapped.etaDate;
    delete mapped.etaDate;
  }
  if ("unloadingDate" in mapped) {
    mapped.unloading_date = mapped.unloadingDate === "" ? null : mapped.unloadingDate;
    delete mapped.unloadingDate;
  }
  if ("party" in mapped) {
    mapped.party = mapped.party;
  }
  if ("cha" in mapped) {
    mapped.cha = mapped.cha;
  }
  if ("shippingLine" in mapped) {
    mapped.shipping_line = mapped.shippingLine;
    delete mapped.shippingLine;
  }
  if ("portOfChina" in mapped) {
    mapped.port_of_china = mapped.portOfChina;
    delete mapped.portOfChina;
  }
  if ("blNo" in mapped) {
    mapped.bl_no = mapped.blNo;
    delete mapped.blNo;
  }
  if ("documentProcessed" in mapped) {
    mapped.document_processed = mapped.documentProcessed;
    delete mapped.documentProcessed;
  }
  if ("loadingDays" in mapped) {
    mapped.loading_days = mapped.loadingDays;
    delete mapped.loadingDays;
  }
  if ("etaDays" in mapped) {
    mapped.eta_days = mapped.etaDays;
    delete mapped.etaDays;
  }
  if ("portName" in mapped) {
    mapped.port_name = mapped.portName;
    delete mapped.portName;
  }
  if ("state" in mapped) {
    mapped.state = mapped.state;
  }
  if ("city" in mapped) {
    mapped.city = mapped.city;
  }
  if ("addressLine1" in mapped) {
    mapped.address_line1 = mapped.addressLine1;
    delete mapped.addressLine1;
  }
  if ("isDefault" in mapped) {
    mapped.is_default = mapped.isDefault;
    delete mapped.isDefault;
  }

  // Remove timestamps & audit info
  delete mapped.createdAt;
  delete mapped.updatedAt;
  delete mapped.createdBy;
  delete mapped.updatedBy;
  delete mapped.__v;

  return mapped;
};

const getTableName = (baseUrl) => {
  const clean = baseUrl.replace(/^\//, "");
  if (clean === "addresses/importers") return "importer_addresses";
  if (clean === "addresses/exporters") return "exporter_addresses";
  if (clean === "hsn") return "hsn_codes";
  if (clean === "transport") return "transports";
  if (clean === "ports/india") return "india_ports";
  if (clean === "ports/china") return "china_ports";
  return clean;
};

const getSelectQuery = (table) => {
  if (table === "containers") {
    return "*, importer:importers(*), exporter:exporters(*), hsnCode:hsn_codes(*)";
  }
  if (table === "importer_addresses") {
    return "*, importer:importers(*)";
  }
  if (table === "exporter_addresses") {
    return "*, exporter:exporters(*)";
  }
  if (table === "products") {
    return "*, hsnCode:hsn_codes(*)";
  }
  return "*";
};

export const createCrudApi = (baseUrl) => {
  const table = getTableName(baseUrl);
  const selectStr = getSelectQuery(table);

  return {
    list: async (params = {}) => {
      const limit = params.limit || 10;
      const page = params.page || 1;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase.from(table).select(selectStr, { count: "exact" });

      if (params.search) {
        if (table === "importers" || table === "exporters" || table === "products") {
          query = query.ilike("name", `%${params.search}%`);
        } else if (table === "containers") {
          query = query.ilike("container_no", `%${params.search}%`);
        } else if (table === "hsn_codes") {
          query = query.ilike("code", `%${params.search}%`);
        } else if (table === "india_ports" || table === "china_ports") {
          query = query.ilike("port_name", `%${params.search}%`);
        }
      }

      if (table === "importer_addresses" && params.importer) {
        query = query.eq("importer_id", params.importer);
      }
      if (table === "exporter_addresses" && params.exporter) {
        query = query.eq("exporter_id", params.exporter);
      }

      if (table === "containers") {
        query = query.order("eta_date", { ascending: true, nullsFirst: false });
      }

      query = query.range(from, to);

      const { data, count, error } = await query;
      if (error) throw error;

      return {
        data: {
          items: mapKeys(data || []),
          total: count || 0,
          page,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    },

    get: async (id) => {
      const { data, error } = await supabase
        .from(table)
        .select(selectStr)
        .eq("id", id)
        .single();
      if (error) throw error;
      return { data: mapKeys(data) };
    },

    create: async (payload) => {
      const mapped = mapPayload(payload);
      const { data, error } = await supabase
        .from(table)
        .insert([mapped])
        .select(selectStr)
        .single();
      if (error) throw error;
      return { data: mapKeys(data) };
    },

    update: async (id, payload) => {
      const mapped = mapPayload(payload);
      const { data, error } = await supabase
        .from(table)
        .update(mapped)
        .eq("id", id)
        .select(selectStr)
        .single();
      if (error) throw error;
      return { data: mapKeys(data) };
    },

    remove: async (id) => {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return { data: mapKeys(data) };
    },
  };
};
