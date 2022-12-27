const express = require("express");

const FeedbackModel = require("../model/Feedback.js");
const { checkConnection } = require("../middleware/connection.js");
const { statusCodes } = require("../constant.js");

const router = express.Router();

router.post("/create", checkConnection, async (req, res) => {
  let { email, priority, feedback } = req.body;
  if (!email || !priority || !feedback) {
    res.status(statusCodes.missingInfo).json({
      message: `Missing fields - ${!email ? "email " : ""}${
        !priority ? "priority " : ""
      }${!feedback ? "feedback " : ""}`,
    });
    return;
  }
  priority += "";

  const name = req?.activeConnection?.name || "";
  const tempPriority =
    priority == "0" ? 0 : priority == "1" ? 1 : priority == "2" ? 2 : 0;

  const newFeedback = new FeedbackModel({
    createdAt: new Date().toISOString(),
    priority: tempPriority,
    feedback,
    email,
    name,
  });

  newFeedback
    .save()
    .then((response) => {
      res.status(statusCodes.created).json({
        message: "Feedback created",
        data: response,
      });
    })
    .catch((err) => {
      res.status(statusCodes.somethingWentWrong).json({
        message: "Error while creating feedback",
        err: err,
      });
    });
});

router.use("/*", (req, res) => {
  res.status(statusCodes.pageNotFound).json({
    message: `Route ${req.baseUrl} does not exist`,
  });
});

module.exports = router;
