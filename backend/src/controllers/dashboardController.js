const dayjs = require("dayjs");
const Container = require("../models/Container");
const Document = require("../models/Document");
const Payment = require("../models/Payment");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { startOfToday, endOfToday, addDays } = require("../utils/dateHelpers");

exports.stats = async (req, res) => {
  try {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();
    const nextWeek = addDays(todayStart, 7);

    const boeContainers = await Document.distinct("container", { docType: "BOE" });

    const [totalContainers, upcomingEta, todaysTasks, doneContainers, pendingContainers, linePaymentPending, pendingBl, pendingBoeCount] = await Promise.all([
      Container.countDocuments(),
      Container.countDocuments({ etaDate: { $gte: todayStart, $lte: nextWeek } }),
      Container.countDocuments({ $or: [{ etaDate: { $gte: todayStart, $lte: todayEnd } }, { unloadingDate: { $gte: todayStart, $lte: todayEnd } }] }),
      Container.countDocuments({ status: { $in: ["done", "DONE"] } }),
      Container.countDocuments({ status: { $nin: ["done", "DONE"] } }),
      Payment.countDocuments({ pendingAmount: { $gt: 0 } }),
      Container.countDocuments({
        status: { $nin: ["done", "DONE"] },
        $or: [
          { blNo: { $exists: false } },
          { blNo: null },
          { blNo: "" }
        ]
      }),
      Container.countDocuments({
        status: { $nin: ["done", "DONE"] },
        _id: { $nin: boeContainers }
      }),
    ]);

    return successResponse(res, {
      totalContainers,
      upcomingEta,
      todaysTasks,
      doneContainers,
      pendingContainers,
      pendingBoe: pendingBoeCount,
      pendingLinePayment: linePaymentPending,
      pendingBl,
    }, "Dashboard stats fetched");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to fetch dashboard stats", 500);
  }
};

exports.upcomingEta = async (req, res) => {
  try {
    const items = await Container.find({ etaDate: { $gte: startOfToday(), $lte: dayjs().add(7, "day").endOf("day").toDate() } })
      .populate("importer exporter")
      .sort("etaDate");
    return successResponse(res, items, "Upcoming ETA fetched");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to fetch upcoming ETA", 500);
  }
};

exports.pendingBoe = async (req, res) => {
  try {
    const withBoe = await Document.distinct("container", { docType: "BOE" });
    const items = await Container.find({ 
      status: { $nin: ["done", "DONE"] },
      _id: { $nin: withBoe } 
    }).populate("importer exporter").sort("etaDate");
    return successResponse(res, items, "Pending BOE fetched");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to fetch pending BOE", 500);
  }
};

exports.pendingLinePayment = async (req, res) => {
  try {
    const items = await Payment.find({ pendingAmount: { $gt: 0 } }).populate("container").sort("-updatedAt");
    return successResponse(res, items, "Pending line payment fetched");
  } catch (error) {
    return errorResponse(res, error.message, "Unable to fetch pending line payment", 500);
  }
};
