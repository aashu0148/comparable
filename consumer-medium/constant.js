const queueTypes = {
  todoBasic: "todoBasic",
  todoMedium: "todoMedium",
  todoHeavy: "todoHeavy",
  todoHeavyMedium: "todoHeavyMedium",
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

const offerScrappersList = [
  allScrappersList.amazon,
  allScrappersList.flipkart,
  allScrappersList.tatacliq,
  allScrappersList.reliance,
  allScrappersList.croma,
];

const offerScrapperQueueTypes = {
  [allScrappersList.amazon]: queueTypes.todoHeavy,
  [allScrappersList.croma]: queueTypes.todoHeavyMedium,
  [allScrappersList.flipkart]: queueTypes.todoHeavy,
  [allScrappersList.tatacliq]: queueTypes.todoHeavy,
  [allScrappersList.reliance]: queueTypes.todoHeavy,
};

const availableSortOptions = {
  popularity: "popularity",
  priceLowToHigh: "priceLowToHigh",
  priceHighToLow: "priceHighToLow",
  newest: "newest",
  featured: "featured",
};

const filterTypes = {
  size: {
    S: "S",
    M: "M",
    L: "L",
    XL: "XL",
    "2XL": "2XL",
    "3XL": "3XL",
    "4XL": "4XL",
    30: 30,
    32: 32,
    34: 34,
    36: 36,
    38: 38,
    40: 40,
    42: 42,
    UK6: "UK6",
    UK7: "UK7",
    UK8: "UK8",
    UK9: "UK9",
    UK10: "UK10",
    UK11: "UK11",
    UK12: "UK12",
    "28A": "28A",
    "30A": "30A",
    "32A": "32A",
    "34A": "34A",
    "36A": "36A",
    "38A": "38A",
    "40A": "40A",
    "28B": "28B",
    "30B": "30B",
    "32B": "32B",
    "34B": "34B",
    "36B": "36B",
    "38B": "38B",
    "40B": "40B",
    "28C": "28C",
    "30C": "30C",
    "32C": "32C",
    "34C": "34C",
    "36C": "36C",
    "38C": "38C",
    "40C": "40C",
    "28D": "28D",
    "30D": "30D",
    "32D": "32D",
    "34D": "34D",
    "36D": "36D",
    "38D": "38D",
    "40D": "40D",
    "28E": "28E",
    "30E": "30E",
    "32E": "32E",
    "34E": "34E",
    "36E": "36E",
    "38E": "38E",
    "40E": "40E",
  },
  gender: {
    men: "men",
    women: "women",
  },
};

const availableFilterOptions = {
  price: "price",
  gender: "gender",
  size: "size",
};

module.exports = {
  queueTypes,
  offerScrapperQueueTypes,
  allScrappersList,
  availableSortOptions,
  availableFilterOptions,
  filterTypes,
  offerScrappersList,
  suggestionScrapperList,
};