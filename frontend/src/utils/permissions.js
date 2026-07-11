// Set this to true to temporarily lock down the whole system to read-only mode
const GLOBAL_READ_ONLY = true;

export const canDelete = (role) => !GLOBAL_READ_ONLY && role === "masterAdmin";
export const canManageUsers = (role) => role === "masterAdmin";
export const canEdit = (role) => !GLOBAL_READ_ONLY && ["masterAdmin", "admin"].includes(role);
