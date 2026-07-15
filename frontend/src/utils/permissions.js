export const canDelete = (role) => ["masterAdmin", "admin"].includes(role);
export const canManageUsers = (role) => role === "masterAdmin";
export const canEdit = (role) => ["masterAdmin", "admin"].includes(role);
