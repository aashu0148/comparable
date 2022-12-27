const express = require("express");
const uuid = require("uuid");

const AnalyticsModel = require("../model/Analytics.js");
const { checkConnection } = require("../middleware/connection");
const {
  allScrappersList,
  scrapperQueueTypes,
  statusCodes,
  queueTypes,
  offerScrappersList,
} = require("../constant");
const { addToQueue } = require("../rabbitMqHandler");
const { getDayMonthYearDate } = require("../util.js");

const router = express.Router();

const updateAnalyticsApiCall = async (section = "general", name) => {
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

router.post("/general", checkConnection, async (req, res) => {
  const query = req.query.search;
  if (!query) {
    res.status(422).json({
      message: "Search query needed",
    });
    return;
  }
  const { sort, filters } = req.body;

  const channel = req.mainChannel;
  const activeConnection = req.activeConnection;
  const globalState = req.globalState || {};

  try {
    const responseKey = uuid.v4();

    const allNeededScrappers = [
      allScrappersList.amazon,
      allScrappersList.flipkart,
      allScrappersList.tatacliq,
    ];
    let commonData = {
      connectionId: activeConnection.connectionId,
      search: query,
      responseKey,
      sort,
      filters,
      fetchOffers: true,
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
      await updateAnalyticsApiCall("general", activeConnection.name);
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

router.post("/fashion", checkConnection, async (req, res) => {
  const query = req.query.search;
  if (!query) {
    res.status(422).json({
      message: "Search query needed",
    });
    return;
  }
  const { sort, filters } = req.body;

  const channel = req.mainChannel;
  const activeConnection = req.activeConnection;
  const globalState = req.globalState || {};

  try {
    const responseKey = uuid.v4();

    const allNeededScrappers = [
      allScrappersList.ajio,
      allScrappersList.flipkart,
      allScrappersList.meesho,
      allScrappersList.amazon,
      allScrappersList.tatacliq,
      allScrappersList.nykaa,
      allScrappersList.snapdeal,
      allScrappersList.shopclues,
    ];
    let commonData = {
      connectionId: activeConnection.connectionId,
      search: query,
      responseKey,
      sort,
      filters,
      globalState,
    };
    const neededScrappers = computerCacheAndGetNeededScrappers(
      req,
      allNeededScrappers,
      commonData,
      true
    );

    neededScrappers.forEach((item) => {
      addToQueue(
        channel,
        { ...commonData, scrapper: item },
        scrapperQueueTypes[item]
      );
    });

    try {
      await updateAnalyticsApiCall("fashion", activeConnection.name);
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

router.post("/electronics", checkConnection, async (req, res) => {
  const query = req.query.search;
  if (!query) {
    res.status(422).json({
      message: "Search query needed",
    });
    return;
  }
  const { sort, filters } = req.body;

  const channel = req.mainChannel;
  const activeConnection = req.activeConnection;
  const globalState = req.globalState || {};

  try {
    const responseKey = uuid.v4();

    const allNeededScrappers = [
      allScrappersList.flipkart,
      allScrappersList.amazon,
      allScrappersList.croma,
      allScrappersList.reliance,
      allScrappersList.shopclues,
    ];
    let commonData = {
      connectionId: activeConnection.connectionId,
      search: query,
      responseKey,
      sort,
      filters,
      fetchOffers: true,
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
      await updateAnalyticsApiCall("electronics", activeConnection.name);
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

router.post("/custom", checkConnection, async (req, res) => {
  const query = req.query.search;
  if (!query) {
    res.status(statusCodes.missingInfo).json({
      message: "Search query needed",
    });
    return;
  }
  const { sort, filters, requestedFrom } = req.body;

  if (!Array.isArray(requestedFrom) || requestedFrom.length == 0) {
    res.status(statusCodes.missingInfo).json({
      message: "Requested from needed",
    });
    return;
  }

  const channel = req.mainChannel;
  const activeConnection = req.activeConnection;
  const globalState = req.globalState || {};

  try {
    const responseKey = uuid.v4();
    const allNeededScrappers = [];

    for (let key in allScrappersList) {
      if (
        allNeededScrappers.length < 5 &&
        requestedFrom.some((item) => item == allScrappersList[key])
      )
        allNeededScrappers.push(allScrappersList[key]);
    }

    let commonData = {
      connectionId: activeConnection.connectionId,
      search: query,
      responseKey,
      sort,
      filters:
        filters && typeof filters == "object" && filters.price
          ? { price: filters.price }
          : undefined,
      fetchOffers: true,
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
      await updateAnalyticsApiCall("custom", activeConnection.name);
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

router.use("/*", (req, res) => {
  res.status(404).json({
    message: `Route ${req.baseUrl} does not exist`,
  });
});

module.exports = router;
