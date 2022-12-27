const queueTypes = {
  todoBasic: "todoBasic",
  todoMedium: "todoMedium",
  todoHeavy: "todoHeavy",
  finishedTask: "finished-task",
};

const allScrappersList = {
  amazon: "amazon",
  flipkart: "flipkart",
  jiomart: "jiomart",
  meesho: "meesho",
  myntra: "myntra",
  tatacliq: "tatacliq",
  ajio: "ajio",
  nykaa: "nykaa",
  snapdeal: "snapdeal",
  reliance: "reliance",
  croma: "croma",
  shopclues: "shopclues",
  oyoHotel: "oyoHotel",
  bookingsHotel: "bookingsHotel",
  hotelsHotel: "hotelsHotel",
  goibiboHotel: "goibiboHotel",
  agodaHotel: "agodaHotel",
  mmtHotel: "mmtHotel",
};

const suggestionScrapperList = {
  hotels: "hotels-suggest",
  oyo: "oyo-suggest",
  bookings: "bookings-suggest",
  goibibo: "goibibo-suggest",
  agoda: "agoda-suggest",
  mmt: "mmt-suggest",
};

const suggestionToScrapperMapping = {
  [suggestionScrapperList.bookings]: [allScrappersList.bookingsHotel],
  [suggestionScrapperList.goibibo]: [allScrappersList.goibiboHotel],
  [suggestionScrapperList.hotels]: [allScrappersList.hotelsHotel],
  [suggestionScrapperList.oyo]: [allScrappersList.oyoHotel],
  [suggestionScrapperList.agoda]: [allScrappersList.agodaHotel],
  [suggestionScrapperList.mmt]: [allScrappersList.mmtHotel],
};

const scrapperToSuggestionMapping = {
  [allScrappersList.bookingsHotel]: [suggestionScrapperList.bookings],
  [allScrappersList.hotelsHotel]: [suggestionScrapperList.hotels],
  [allScrappersList.goibiboHotel]: [suggestionScrapperList.goibibo],
  [allScrappersList.oyoHotel]: [suggestionScrapperList.oyo],
  [allScrappersList.agodaHotel]: [suggestionScrapperList.agoda],
  [allScrappersList.mmtHotel]: [suggestionScrapperList.mmt],
};

const offerScrappersList = [
  allScrappersList.amazon,
  allScrappersList.flipkart,
  // allScrappersList.tatacliq,
  allScrappersList.reliance,
  allScrappersList.croma,
];

const scrapperQueueTypes = {
  [allScrappersList.flipkart]: queueTypes.todoBasic,
  [allScrappersList.ajio]: queueTypes.todoBasic,
  [allScrappersList.tatacliq]: queueTypes.todoBasic,
  [allScrappersList.nykaa]: queueTypes.todoBasic,
  [allScrappersList.shopclues]: queueTypes.todoBasic,
  [allScrappersList.snapdeal]: queueTypes.todoBasic,
  [allScrappersList.reliance]: queueTypes.todoBasic,
  [allScrappersList.croma]: queueTypes.todoBasic,
  [allScrappersList.hotelsHotel]: queueTypes.todoBasic,
  [allScrappersList.bookingsHotel]: queueTypes.todoBasic,
  [allScrappersList.goibiboHotel]: queueTypes.todoBasic,
  [allScrappersList.oyoHotel]: queueTypes.todoBasic,
  [allScrappersList.hotelsHotel]: queueTypes.todoBasic,
  [allScrappersList.goibiboHotel]: queueTypes.todoBasic,
  [allScrappersList.goibiboHotel]: queueTypes.todoBasic,
  [allScrappersList.agodaHotel]: queueTypes.todoBasic,
  [suggestionScrapperList.bookings]: queueTypes.todoBasic,
  [suggestionScrapperList.oyo]: queueTypes.todoBasic,
  [suggestionScrapperList.mmt]: queueTypes.todoBasic,
  [suggestionScrapperList.agoda]: queueTypes.todoBasic,
  [suggestionScrapperList.hotels]: queueTypes.todoBasic,
  [suggestionScrapperList.goibibo]: queueTypes.todoMedium,
  [allScrappersList.mmtHotel]: queueTypes.todoMedium,
  [allScrappersList.amazon]: queueTypes.todoMedium,
  [allScrappersList.meesho]: queueTypes.todoMedium,
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

module.exports = {
  queueTypes,
  allScrappersList,
  statusCodes,
  availableSortOptions,
  scrapperQueueTypes,
  offerScrappersList,
  suggestionScrapperList,
  suggestionToScrapperMapping,
  scrapperToSuggestionMapping,
};
