const uuid = require("uuid");

const {
  allScrappersList,
  scrapperQueueTypes,
  statusCodes,
  queueTypes,
  offerScrappersList,
} = require("../../constant");
const { addToQueue } = require("../../rabbitMqHandler");

const computerCacheAndGetNeededScrappers = (
  req,
  allNeededScrappers,
  commonData,
  ignoreOffers = false
) => {
  const channel = req.mainChannel;
  const requestCache = req.requestCache;
  const searchQuery = req.query.search;
  let neededScrappers = [];

  const cacheIndex = requestCache.findIndex(
    (item) => item.search == searchQuery
  );
  if (cacheIndex > -1) {
    const cache = requestCache[cacheIndex];
    if (cache.date + 6 * 60 * 60 * 1000 < Date.now()) {
      req.removeCache(cacheIndex);
      neededScrappers = [...allNeededScrappers];
    } else {
      allNeededScrappers.forEach((scrapper) => {
        const result = cache.data[scrapper]?.result;
        const offers = cache.data[scrapper]?.offers;
        const isOfferScrapperAvailable = offerScrappersList.some(
          (item) => item == scrapper
        )
          ? ignoreOffers
            ? false
            : true
          : false;

        if (
          result &&
          result.length > 0 &&
          ((offers && offers.length > 0 && isOfferScrapperAvailable) ||
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

const computeEcomerce = async (req, res) => {
  const maximumScrapperAtOnce = 6;
  const query = req.query.search;
  if (!query) {
    res.status(statusCodes.missingInfo).json({
      message: "Search query needed",
    });
    return;
  }
  const { sort, requestedFrom } = req.body;

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
        allNeededScrappers.length < maximumScrapperAtOnce &&
        requestedFrom.some((item) => item == allScrappersList[key])
      )
        allNeededScrappers.push(allScrappersList[key]);
    }

    let commonData = {
      connectionId: activeConnection.connectionId,
      search: query,
      responseKey,
      sort,
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

    // try {
    //   await updateAnalyticsApiCall("custom", activeConnection.name);
    // } catch (err) {
    //   console.log("Error updating analytics", err);
    // }

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
      error: err + "",
    });
    return;
  }
};

module.exports = {
  computeEcomerce,
};
