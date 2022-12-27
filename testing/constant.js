const queueTypes = {
  todo: "todo",
  finishedTask: "finished-task",
};

const allScrappersList = {
  amazon: "amazon",
  amazonOffers: "amazonOffers",
  flipkart: "flipkart",
  flipkartOffers: "flipkartOffers",
  jiomart: "jiomart",
  meesho: "meesho",
  myntra: "myntra",
  tatacliq: "tatacliq",
  ajio: "ajio",
  nykaa: "nykaa",
  snapdeal: "snapdeal",
};

const statusCodes = {
  missingInfo: 400,
  noDataAvailable: 403,
  pageNotFound: 404,
  ok: 200,
  created: 201,
  invalidDataSent: 422,
  somethingWentWrong: 500,
  unauthorized: 401,
  databaseError: 502,
  limitReached: 402,
};

const availableSortOptions = {
  popularity: "popularity",
  priceLowToHigh: "priceLowToHigh",
  priceHighToLow: "priceHighToLow",
  newest: "newest",
  featured: "featured",
};

const sortOptionsExpanded = {
  amazon: {
    [availableSortOptions.popularity]: "&s=review-rank",
    [availableSortOptions.priceLowToHigh]: "&s=price-asc-rank",
    [availableSortOptions.priceHighToLow]: "&s=price-desc-rank",
    [availableSortOptions.newest]: "&s=date-desc-rank",
    [availableSortOptions.featured]: "",
  },
  flipkart: {
    [availableSortOptions.popularity]: "&sort=popularity",
    [availableSortOptions.priceLowToHigh]: "&sort=price_asc",
    [availableSortOptions.priceHighToLow]: "&sort=price_desc",
    [availableSortOptions.newest]: "&sort=recency_desc",
    [availableSortOptions.featured]: "&sort=relevance",
  },
  tatacliq: {
    [availableSortOptions.popularity]: ":relevance",
    [availableSortOptions.priceLowToHigh]: ":price-asc",
    [availableSortOptions.priceHighToLow]: ":price-desc",
    [availableSortOptions.newest]: ":isProductNew",
    [availableSortOptions.featured]: "",
  },
};

module.exports = {
  queueTypes,
  allScrappersList,
  statusCodes,
  availableSortOptions,
  sortOptionsExpanded,
};
