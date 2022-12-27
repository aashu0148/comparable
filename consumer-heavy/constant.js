const queueTypes = {
  todoBasic: "todoBasic",
  todoMedium: "todoMedium",
  todoHeavy: "todoHeavy",
  todoHeavyMedium: "todoHeavyMedium",
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
};

const offerScrappersList = [
  allScrappersList.amazon,
  allScrappersList.flipkart,
  allScrappersList.tatacliq,
  allScrappersList.reliance,
  allScrappersList.croma,
];

module.exports = {
  queueTypes,
  allScrappersList,
  offerScrappersList,
};
