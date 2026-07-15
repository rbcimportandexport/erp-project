const ActivityLog = require("../models/ActivityLog");

const writeActivityLog = async ({ req, action, module, recordId, description }) => {
  await ActivityLog.create({
    user: req.user?._id,
    action,
    module,
    recordId,
    description,
    ipAddress: req.ip,
  });
};

module.exports = { writeActivityLog };
