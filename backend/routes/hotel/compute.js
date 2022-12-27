const express = require("express");
const uuid = require("uuid");

const AnalyticsModel = require("../../model/Analytics.js");
const { checkConnection } = require("../../middleware/connection");
const {
  allScrappersList,
  scrapperQueueTypes,
  statusCodes,
  queueTypes,
  offerScrappersList,
} = require("../../constant.js");
const { addToQueue } = require("../../rabbitMqHandler");
const { getDayMonthYearDate } = require("../../util.js");

const router = express.Router();

const updateAnalyticsApiCall = async (section = "hotel", name) => {
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
    const callCount = analytic?.apiCallCount[section];
    if (callCount && typeof callCount == "object") {
      callCount.totalCount = (parseInt(callCount.totalCount) || 0) + 1;

      const users = Array.isArray(callCount.users) ? [...callCount.users] : [];
      const userIndex = users.findIndex((item) => item.name == name);
      let user;
      if (userIndex < 0) {
        user = {
          name,
          count: 1,
        };
        users.push(user);
      } else {
        user = users[userIndex];
        user.count = (parseInt(user.count) || 0) + 1;
      }
      callCount.users = users;
      analytic.updatedAt = new Date().toISOString();
    }
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
        hotel: {
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
        [allScrappersList.hotelsHotel]: 0,
        [allScrappersList.bookingsHotel]: 0,
        [allScrappersList.goibiboHotel]: 0,
        [allScrappersList.oyoHotel]: 0,
      },
      createdDate: getDayMonthYearDate(),
    });
  }

  analytic.markModified("apiCallCount");
  analytic
    .save()
    .catch((err) =>
      console.log(`error saving analytic details in ${section} section`, err)
    );
};

const computerCacheAndGetNeededScrappers = (
  req,
  allNeededScrappers,
  commonData,
  ignoreOffers = false
) => {
  const channel = req.mainChannel;
  const requestCache = req.requestCache;
  const query = req.query.search;
  let neededScrappers = [];

  const cacheIndex = requestCache.findIndex((item) => item.search == query);
  if (cacheIndex > -1) {
    const cache = requestCache[cacheIndex];
    if (cache.date + 6 * 60 * 60 * 1000 < Date.now()) {
      req.removeCache(cacheIndex);
      neededScrappers = [...allNeededScrappers];
    } else {
      allNeededScrappers.forEach((scrapper) => {
        const result = cache.data[scrapper]?.result;
        const offers = cache.data[scrapper]?.offers;
        const isOfferScrapperAvailable = ignoreOffers
          ? false
          : offerScrappersList.includes(scrapper);

        if (
          result &&
          result.length > 0 &&
          ((offerScrappersList && offers && offers.length > 0) ||
            !isOfferScrapperAvailable)
        ) {
          addToQueue(
            channel,
            { ...commonData, scrapper, result },
            queueTypes.finishedTask
          );

          if (isOfferScrapperAvailable)
            addToQueue(
              channel,
              {
                ...commonData,
                scrapper,
                isOfferDetails: true,
                offers,
              },
              queueTypes.finishedTask
            );
        } else neededScrappers.push(scrapper);
      });
    }
  } else neededScrappers = [...allNeededScrappers];

  return neededScrappers;
};

router.post("/compute", checkConnection, async (req, res) => {
  const query = req.query.search;
  if (!query) {
    res.status(422).json({
      message: "Search query needed",
    });
    return;
  }
  const { options } = req.body;
  if (typeof options !== "object") {
    res.status(422).json({
      message: "Options not present",
    });
    return;
  } else if (
    !options.adults ||
    !options.rooms ||
    !options.checkInDate ||
    !options.checkOutDate ||
    !options.lat ||
    !options.long
  ) {
    res.status(422).json({
      message: "complete data not available in options!",
    });
    return;
  }

  const channel = req.mainChannel;
  const activeConnection = req.activeConnection;
  const globalState = req.globalState || {};

  try {
    const responseKey = uuid.v4();

    const allNeededScrappers = [
      allScrappersList.bookingsHotel,
      allScrappersList.hotelsHotel,
      allScrappersList.goibiboHotel,
      allScrappersList.oyoHotel,
    ];
    let commonData = {
      connectionId: activeConnection.connectionId,
      search: query,
      responseKey,
      options,
      globalState,
    };
    const neededScrappers = computerCacheAndGetNeededScrappers(
      req,
      allNeededScrappers,
      commonData
    );

    neededScrappers.forEach((item) => {
      addToQueue(
        channel,
        { ...commonData, scrapper: item },
        scrapperQueueTypes[item]
      );
    });

    try {
      await updateAnalyticsApiCall("hotel", activeConnection.name);
    } catch (err) {
      console.log("Error updating analytics", err);
    }

    res.status(200).json({
      message: "Processing your query, please wait.",
      data: {
        responseKey,
        search: query,
        expectedFrom: allNeededScrappers,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err,
    });
    return;
  }
});

module.exports = router;
