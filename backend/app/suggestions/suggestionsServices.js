const uuid = require("uuid");
const axios = require("axios");

const SuggestionsSchema = require("./suggestionsSchema.js");
const {
  statusCodes,
  queueTypes,
  suggestionScrapperList,
  scrapperQueueTypes,
} = require("../../constant.js");
const { addToQueue } = require("../../rabbitMqHandler");

const computeSuggestionsAndGetNeededScrapper = (
  data,
  commonData,
  allNeededScrappers = Object.values(suggestionScrapperList)
) => {
  let neededScrappers = [];
  let dataAvailable = [];

  if (!data || typeof data !== "object" || Object.keys(data).length == 0) {
    return { neededScrappers: allNeededScrappers, dataAvailable };
  }

  allNeededScrappers.forEach((scrapper) => {
    if (
      data[scrapper] &&
      Array.isArray(data[scrapper]) &&
      data[scrapper].length > 0
    ) {
      dataAvailable.push({
        ...commonData,
        isSuggestion: true,
        scrapper,
        result: data[scrapper],
      });
    } else {
      neededScrappers.push(scrapper);
    }
  });

  return { neededScrappers, dataAvailable };
};

const fetchAmazonSuggestion = async (query) => {
  if (!query) return [];
  const res = await axios.get(
    `https://completion.amazon.in/api/2017/suggestions?limit=11&prefix=${query}&suggestion-type=WIDGET&suggestion-type=KEYWORD&page-type=Search&alias=aps&site-variant=desktop&version=3&event=onKeyPress&wc&lop=en_IN&fb=1&plain-mid=44571&client-info=amazon-search-ui`
  );

  if (Array.isArray(res.data?.suggestions))
    return res.data.suggestions.map((item) => item.value);
  else return [];
};

const getEcomerceSuggestions = async (req, res) => {
  const query = req.query.search;
  if (!query) {
    res.status(statusCodes.noDataAvailable).json({
      message: "No data available for empty query",
      success: false,
    });
    return;
  }

  const results = await fetchAmazonSuggestion(query);

  res.status(statusCodes.ok).json({
    success: true,
    message: "Suggestions" + results.length > 0 ? " found" : " not found",
    data: results,
  });
};

const getHotelSuggestions = async (req, res) => {
  let query = req.query.search;
  if (!query) {
    res.status(statusCodes.noDataAvailable).json({
      message: "No data available for empty query",
      success: false,
    });
    return;
  }
  query = query.trim().toLowerCase();

  const responseKey = uuid.v4();
  const channel = req.mainChannel;
  const activeConnection = req.activeConnection;

  let dbResult;
  try {
    dbResult = await SuggestionsSchema.findOne({
      query,
      type: "hotel",
    });
  } catch (err) {
    res.status(statusCodes.somethingWentWrong).json({
      success: false,
      message: "Something went wrong!",
      error: err,
    });
  }

  const commonData = {
    connectionId: activeConnection.connectionId,
    search: query,
    responseKey,
    isSuggestion: true,
  };

  let neededScrappers,
    dataAvailable = [];
  if (!dbResult?.data) neededScrappers = Object.values(suggestionScrapperList);
  else {
    const obj = computeSuggestionsAndGetNeededScrapper(
      dbResult.data,
      commonData
    );
    neededScrappers = obj.neededScrappers;
    dataAvailable = obj.dataAvailable;
  }

  neededScrappers.forEach((item) => {
    addToQueue(
      channel,
      { ...commonData, scrapper: item },
      scrapperQueueTypes[item]
    );
  });

  res.status(200).json({
    message: "Processing your query, please wait.",
    data: {
      responseKey,
      search: query,
      expectedFrom: Object.values(suggestionScrapperList),
    },
  });
  setTimeout(() => {
    dataAvailable.forEach((item) =>
      req.handleSuggestionsData(item, true, dbResult.queryCount + 1)
    );
  }, 500);
};

module.exports = {
  getHotelSuggestions,
  getEcomerceSuggestions,
};
