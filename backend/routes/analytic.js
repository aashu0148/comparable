const express = require("express");

const AnalyticsModel = require("../model/Analytics.js");
const { checkConnection } = require("../middleware/connection");
const { allScrappersList, statusCodes } = require("../constant");
const { getDayMonthYearDate } = require("../util.js");

const router = express.Router();

const updateAnalyticsLinkCount = async (scrapper) => {
  let analytic;
  try {
    analytic = await AnalyticsModel.findOne({
      createdDate: getDayMonthYearDate(),
    });
  } catch (err) {
    console.log("Error querying to DB", err);
    return;
  }

  if (analytic) {
    analytic.linkClickCount[scrapper] =
      parseInt(analytic.linkClickCount[scrapper] || 0) + 1;

    analytic.updatedAt = new Date().toISOString();
  } else {
    analytic = new AnalyticsModel({
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      apiCallCount: {
        general: {
          users: [],
          totalCount: 0,
        },
        fashion: {
          users: [],
          totalCount: 0,
        },
        mobiles: {
          users: [],
          totalCount: 0,
        },
        custom: {
          users: [],
          totalCount: 0,
        },
        electronics: {
          users: [],
          totalCount: 0,
        },
        custom: {
          users: [],
          totalCount: 0,
        },
      },
      linkClickCount: {
        [allScrappersList.amazon]: 0,
        [allScrappersList.flipkart]: 0,
        [allScrappersList.tatacliq]: 0,
        [allScrappersList.nykaa]: 0,
        [allScrappersList.meesho]: 0,
        [allScrappersList.jiomart]: 0,
        [allScrappersList.myntra]: 0,
        [allScrappersList.reliance]: 0,
        [allScrappersList.croma]: 0,
        [allScrappersList.ajio]: 0,
        [allScrappersList.shopclues]: 0,
        [allScrappersList.snapdeal]: 0,
      },
      createdDate: getDayMonthYearDate(),
    });
  }

  analytic.markModified("linkClickCount");
  analytic
    .save()
    .catch((err) => console.log(`error saving analytic details`, err));
};

router.get("/link-click", checkConnection, async (req, res) => {
  const from = req.query.from;
  if (!from) {
    res.status(statusCodes.missingInfo).json({
      message: "From value needed",
    });
    return;
  }
  if (!Object.values(allScrappersList).some((item) => item == from)) {
    res.status(statusCodes.invalidDataSent).json({
      message: "Invalid from value",
    });
    return;
  }

  await updateAnalyticsLinkCount(from);

  res.status(statusCodes.ok).json({ message: "ok" });
});

router.use("/*", (req, res) => {
  res.status(statusCodes.pageNotFound).json({
    message: `Route ${req.baseUrl} does not exist`,
  });
});

module.exports = router;
