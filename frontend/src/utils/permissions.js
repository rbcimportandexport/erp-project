export const canDelete = (role) => role === "masterAdmin";
export const canManageUsers = (role) => role === "masterAdmin";
export const canEdit = (role) => ["masterAdmin", "admin"].includes(role);
