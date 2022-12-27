const express = require("express");

const FeedbackModel = require("../model/Feedback.js");
const AnalyticsModel = require("../model/Analytics.js");
const { statusCodes } = require("../constant.js");

const router = express.Router();

router.get("/get/analytics", async (req, res) => {
  const results = await AnalyticsModel.find({}, null, {
    sort: { createdAt: -1 },
    limit: 60,
  });
  if (!results.length) {
    res.status(statusCodes.noDataAvailable).json({ message: "Data not found" });
    return;
  }
  res.status(statusCodes.ok).json({
    success: true,
    message: "Analytics found",
    data: results,
  });
});

router.get("/get/feedback", async (req, res) => {
  const results = await FeedbackModel.find({}, null, {
    sort: { createdAt: -1 },
    limit: 60,
  });

  res.status(statusCodes.ok).json({
    success: true,
    message: "Feedback found",
    data: results,
  });
});

router.use("/*", (req, res) => {
  res.status(statusCodes.pageNotFound).json({
    message: `Route ${req.baseUrl} does not exist`,
  });
});

module.exports = router;
