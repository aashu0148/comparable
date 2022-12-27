export const allScrappersList = {
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

export const platformNames = {
  [allScrappersList.agodaHotel]: "Agoda",
  [allScrappersList.goibiboHotel]: "Goibibo",
  [allScrappersList.hotelsHotel]: "Hotels.com",
  [allScrappersList.bookingsHotel]: "Bookings",
  [allScrappersList.oyoHotel]: "Oyo",
  [allScrappersList.mmtHotel]: "Make_my_trip",
  [allScrappersList.shopclues]: "ShopClues",
  [allScrappersList.amazon]: "Amazon",
  [allScrappersList.flipkart]: "Flipkart",
  [allScrappersList.jiomart]: "Jiomart",
  [allScrappersList.meesho]: "Meesho",
  [allScrappersList.myntra]: "Myntra",
  [allScrappersList.tatacliq]: "Tatacliq",
  [allScrappersList.ajio]: "Ajio",
  [allScrappersList.nykaa]: "Nykaa",
  [allScrappersList.snapdeal]: "Snapdeal",
  [allScrappersList.reliance]: "Reliance",
  [allScrappersList.croma]: "Croma",
};

export const suggestionScrapperList = {
  hotels: "hotels-suggest",
  oyo: "oyo-suggest",
  bookings: "bookings-suggest",
  goibibo: "goibibo-suggest",
  agoda: "agoda-suggest",
  mmt: "mmt-suggest",
};

export const suggestionToScrapperMapping = {
  [suggestionScrapperList.bookings]: [allScrappersList.bookingsHotel],
  [suggestionScrapperList.goibibo]: [allScrappersList.goibiboHotel],
  [suggestionScrapperList.hotels]: [allScrappersList.hotelsHotel],
  [suggestionScrapperList.oyo]: [allScrappersList.oyoHotel],
  [suggestionScrapperList.agoda]: [allScrappersList.agodaHotel],
  [suggestionScrapperList.mmt]: [allScrappersList.mmtHotel],
};

export const scrapperToSuggestionMapping = {
  [allScrappersList.bookingsHotel]: [suggestionScrapperList.bookings],
  [allScrappersList.hotelsHotel]: [suggestionScrapperList.hotels],
  [allScrappersList.goibiboHotel]: [suggestionScrapperList.goibibo],
  [allScrappersList.oyoHotel]: [suggestionScrapperList.oyo],
  [allScrappersList.agodaHotel]: [suggestionScrapperList.agoda],
  [allScrappersList.mmtHotel]: [suggestionScrapperList.mmt],
};

export const offerScrappersList = [
  allScrappersList.amazon,
  allScrappersList.flipkart,
  allScrappersList.tatacliq,
  allScrappersList.reliance,
  allScrappersList.croma,
];

export const logoMappingWithScrapper = {
  [allScrappersList.amazon]: {
    square: "/logos/amazonLogo.svg",
    rect: "/logos/amazonRectLogo.svg",
  },
  [allScrappersList.flipkart]: {
    square: "/logos/flipkartLogo.svg",
    rect: "/logos/flipkartRectLogo.svg",
  },
  [allScrappersList.nykaa]: {
    square: "/logos/nykaaLogo.svg",
    rect: "/logos/nykaaLogo.svg",
  },
  [allScrappersList.ajio]: {
    square: "/logos/ajioLogo.svg",
    rect: "/logos/ajioLogo.svg",
  },
  [allScrappersList.tatacliq]: {
    square: "/logos/tatacliqLogo.svg",
    rect: "/logos/tatacliqLogo.svg",
  },
  [allScrappersList.meesho]: {
    square: "/logos/meeshoLogo.svg",
    rect: "/logos/meeshoLogo.svg",
  },
  [allScrappersList.myntra]: {
    square: "/logos/myntraLogo.svg",
    rect: "/logos/myntraLogo.svg",
  },
  [allScrappersList.reliance]: {
    square: "/logos/relianceLogo.svg",
    rect: "/logos/relianceRectLogo.svg",
  },
  [allScrappersList.croma]: {
    square: "/logos/cromaLogo.svg",
    rect: "/logos/cromaLogo.svg",
  },
  [allScrappersList.snapdeal]: {
    square: "/logos/snapdealLogo.svg",
    rect: "/logos/snapdealRectLogo.svg",
  },
  [allScrappersList.shopclues]: {
    square: "/logos/shopcluesLogo.svg",
    rect: "/logos/shopcluesRectLogo.svg",
  },
  [allScrappersList.bookingsHotel]: {
    square: "/logos/bookingLogo.svg",
    rect: "/logos/bookingLogo.svg",
  },
  [allScrappersList.hotelsHotel]: {
    square: "/logos/hotelsLogo.svg",
    rect: "/logos/hotelsLogo.svg",
  },
  [allScrappersList.goibiboHotel]: {
    square: "/logos/goibiboLogo.svg",
    rect: "/logos/goibiboLogo.svg",
  },
  [allScrappersList.agodaHotel]: {
    square: "/logos/agodaLogo.svg",
    rect: "/logos/agodaLogo.svg",
  },
  [allScrappersList.oyoHotel]: {
    square: "/logos/oyoLogo.svg",
    rect: "/logos/oyoLogo.svg",
  },
  [allScrappersList.mmtHotel]: {
    square: "/logos/mmtLogo.svg",
    rect: "/logos/mmtRectLogo.svg",
  },
};

export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
