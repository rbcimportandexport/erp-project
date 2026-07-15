const dayjs = require("dayjs");

const startOfToday = () => dayjs().startOf("day").toDate();
const endOfToday = () => dayjs().endOf("day").toDate();
const addDays = (date, days) => dayjs(date).add(days, "day").toDate();

module.exports = { startOfToday, endOfToday, addDays };
