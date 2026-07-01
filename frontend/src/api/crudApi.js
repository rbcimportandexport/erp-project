import { supabase } from "../supabaseClient";

// Helper to map DB column keys (id <-> _id)
const mapKeys = (item) => {
  if (!item || typeof item !== "object") return item;
  if (Array.isArray(item)) return item.map(mapKeys);

  const mapped = { ...item };
  if (mapped.id) {
    mapped._id = mapped.id;
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
    mapped.importer_id = mapped.importer;
    delete mapped.importer;
  }
  if ("exporter" in mapped) {
    mapped.exporter_id = mapped.exporter;
    delete mapped.exporter;
  }
  if ("hsnCode" in mapped) {
    mapped.hsn_code_id = mapped.hsnCode;
    delete mapped.hsnCode;
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
        } else if (table === "hsn_codes" || table === "india_ports" || table === "china_ports") {
          query = query.ilike("code", `%${params.search}%`);
        }
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
