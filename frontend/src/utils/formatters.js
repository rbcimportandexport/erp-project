import dayjs from "dayjs";

export const formatDate = (date) => (date ? dayjs(date).format("DD MMM YYYY") : "-");
export const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(amount || 0));
