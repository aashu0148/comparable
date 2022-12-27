const uuid = require("uuid");

const {
  allScrappersList,
  scrapperQueueTypes,
  statusCodes,
  queueTypes,
  offerScrappersList,
  suggestionScrapperList,
  scrapperToSuggestionMapping,
} = require("../../constant.js");
const { addToQueue } = require("../../rabbitMqHandler");

const computerCacheAndGetNeededScrappers = (
  req,
  allNeededScrappers,
  commonData
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

        if (result && result.length > 0) {
          addToQueue(
            channel,
            { ...commonData, scrapper, result },
            queueTypes.finishedTask
          );
        } else neededScrappers.push(scrapper);
      });
    }
  } else neededScrappers = [...allNeededScrappers];

  return neededScrappers;
};

const getHotels = async (req, res) => {
  const query = req.query.search;
  if (!query) {
    res.status(422).json({
      message: "Search query needed",
    });
    return;
  }
  const { options, requestedFrom } = req.body;
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
    !options.details
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

    let allNeededScrappers;
    if (Array.isArray(requestedFrom) && requestedFrom.length > 0)
      allNeededScrappers = requestedFrom;
    else
      allNeededScrappers = [
        allScrappersList.bookingsHotel,
        allScrappersList.hotelsHotel,
        allScrappersList.goibiboHotel,
        allScrappersList.oyoHotel,
        allScrappersList.agodaHotel,
        allScrappersList.mmtHotel,
      ];

    let commonData = {
      connectionId: activeConnection.connectionId,
      search: query,
      responseKey,
      options: { ...options, details: "" },
      globalState,
    };
    const neededScrappers = computerCacheAndGetNeededScrappers(
      req,
      allNeededScrappers,
      commonData
    );

    neededScrappers.forEach((item) => {
      const itemDetails = options.details[scrapperToSuggestionMapping[item]];
      if (itemDetails) {
        const data = {
          ...commonData,
          scrapper: item,
          options: { ...commonData.options, ...itemDetails },
        };

        addToQueue(channel, data, scrapperQueueTypes[item]);
      }
    });

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
};

module.exports = {
  getHotels,
};
