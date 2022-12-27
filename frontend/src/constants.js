import amazonSquareLogo from "assets/logos/amazon-logo.png";
import flipkartSquareLogo from "assets/images/flipkart.png";
import tatacliqSquareLogo from "assets/images/tata-cliq.png";
import relianceSquareLogo from "assets/images/rd-logo.png";
import ajioSquareLogo from "assets/images/ajio-logo.png";
import cromaSquareLogo from "assets/images/croma-logo.png";
import snapdealSquareLogo from "assets/images/sd-logo.png";
import shopcluesSquareLogo from "assets/images/shopclues-logo.png";
import nykaaSquareLogo from "assets/logos/nykaa.png";
import meeshoSquareLogo from "assets/logos/meesho.png";

import flipkartRectLogo from "assets/logos/flipkart.png";
import ajioRectLogo from "assets/logos/ajio.png";
import amazonRectLogo from "assets/logos/amazon.png";
import tatacliqRectLogo from "assets/logos/tatacliq.png";
import snapdealRectLogo from "assets/logos/snapdeal.png";
import relianceRectLogo from "assets/logos/reliance.png";
import cromaRectLogo from "assets/logos/croma-logo.png";
import nykaaRectLogo from "assets/logos/nykaa.png";
import meeshoRectLogo from "assets/logos/meesho.png";
import shopcluesRectLogo from "assets/logos/shopclues.png";

import menShoes from "assets/avatars/menProducts/shoes.png";
import menJacket from "assets/avatars/menProducts/jacket.png";
import menKurta from "assets/avatars/menProducts/kurta.png";
import menShirt from "assets/avatars/menProducts/shirt.png";
import menTshirt from "assets/avatars/menProducts/tshirt.png";
import menTrouser from "assets/avatars/menProducts/trouser.png";

import womenFootwear from "assets/avatars/womenProducts/footwear.png";
import womenJeans from "assets/avatars/womenProducts/jeans.png";
import womenKurti from "assets/avatars/womenProducts/kurta.png";
import lehnga from "assets/avatars/womenProducts/lehnga.png";
import saree from "assets/avatars/womenProducts/saree.png";
import womenTopwear from "assets/avatars/womenProducts/topwear.png";

import tv from "assets/categoryImages/tv.png";
import ac from "assets/categoryImages/ac.png";
import mobile from "assets/categoryImages/mobile.png";
import laptop from "assets/categoryImages/laptop.png";
import refrigerator from "assets/categoryImages/refrigerator.png";
import headphones from "assets/categoryImages/headphones.png";
import mixer from "assets/categoryImages/mixer&juicer.png";
import washingMachine from "assets/categoryImages/washingMachine.png";

export const availableCategories = {
  electronics: "electronics",
  mobiles: "mobiles",
  custom: "custom",
  fashion: "fashion",
};

export const allScrappersList = {
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
};

export const availableSortOptions = {
  relevance: "relevance",
  popularity: "popularity",
  priceLowToHigh: "priceLowToHigh",
  priceHighToLow: "priceHighToLow",
  newest: "newest",
  featured: "featured",
  ratings: "ratings",
};

export const availableFilterOptions = {
  price: "price",
  gender: "gender",
  size: "size",
};

export const categoryWiseFilters = {
  general: ["price"],
  electronics: ["price"],
  custom: ["price"],
  fashion: ["price", "gender", "size"],
};

export const filterValues = {
  price: ["50", "1000000"],
  gender: ["men", "women"],
  size: [
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "3XL",
    "4XL",
    "30",
    "32",
    "34",
    "36",
    "38",
    "40",
    "42",
    "UK6",
    "UK7",
    "UK8",
    "UK9",
    "UK10",
    "UK11",
    "UK12",
    "28A",
    "30A",
    "32A",
    "34A",
    "36A",
    "38A",
    "40A",
    "28B",
    "30B",
    "32B",
    "34B",
    "36B",
    "38B",
    "40B",
    "28C",
    "30C",
    "32C",
    "34C",
    "36C",
    "38C",
    "40C",
    "28D",
    "30D",
    "32D",
    "34D",
    "36D",
    "38D",
    "40D",
    "28E",
    "30E",
    "32E",
    "34E",
    "36E",
    "38E",
    "40E",
  ],
};

export const logoMappingWithScrapper = {
  [allScrappersList.amazon]: {
    square: amazonSquareLogo,
    rect: amazonRectLogo,
  },
  [allScrappersList.flipkart]: {
    square: flipkartSquareLogo,
    rect: flipkartRectLogo,
  },
  [allScrappersList.nykaa]: {
    square: nykaaSquareLogo,
    rect: nykaaRectLogo,
  },
  [allScrappersList.ajio]: {
    square: ajioSquareLogo,
    rect: ajioRectLogo,
  },
  [allScrappersList.tatacliq]: {
    square: tatacliqSquareLogo,
    rect: tatacliqRectLogo,
  },
  [allScrappersList.meesho]: {
    square: meeshoSquareLogo,
    rect: meeshoRectLogo,
  },
  [allScrappersList.reliance]: {
    square: relianceSquareLogo,
    rect: relianceRectLogo,
  },
  [allScrappersList.croma]: {
    square: cromaSquareLogo,
    rect: cromaRectLogo,
  },
  [allScrappersList.snapdeal]: {
    square: snapdealSquareLogo,
    rect: snapdealRectLogo,
  },
  [allScrappersList.shopclues]: {
    square: shopcluesSquareLogo,
    rect: shopcluesRectLogo,
  },
};

export const fashionSelectionMapping = {
  men: [
    {
      "T-shirt": menTshirt,
    },
    {
      Shirt: menShirt,
    },
    {
      Jacket: menJacket,
    },
    {
      Trouser: menTrouser,
    },
    {
      Kurta: menKurta,
    },
    {
      Shoes: menShoes,
    },
  ],
  women: [
    {
      Topwear: womenTopwear,
    },
    {
      Kurtis: womenKurti,
    },
    {
      Footwear: womenFootwear,
    },
    {
      Jeans: womenJeans,
    },
    {
      Saree: saree,
    },
    {
      Lenhga: lehnga,
    },
  ],
};

export const electronicsSelectionMapping = [
  {
    TV: tv,
  },
  {
    Mobile: mobile,
  },
  {
    Refrigerator: refrigerator,
  },
  {
    Juicers: mixer,
  },
  {
    Headphones: headphones,
  },
  {
    Laptops: laptop,
  },
  {
    AC: ac,
  },
  {
    "Washing machine": washingMachine,
  },
];

export const searchPageViewTypes = {
  scrolling: "scrolling",
  deckView: "deckView",
  clubbed: "clubbed",
};

export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const themeColors = {
  light: {
    ["black"]: "#0b0b0b",
    ["white"]: "#fefefe",
    ["bg-primary"]: "#258cf4",
    ["bg-secondary"]: "#62aaf3",
    ["bg-light-gray"]: "#f8f9fb",
    ["bg-medium-gray"]: "#e8ebf3",
    ["bg-dark"]: "#191e22",
    ["bg-red"]: "#e64724",
    ["bg-green"]: "#1ccb12",
    ["bg-dark-green"]: "#109e0d",
    ["bg-yellow"]: "#f3e11f",
    ["bg-bluish-white"]: "#f6fbff",
    ["bg-black-translucent"]: "rgba(0, 0, 0, 0.7)",
    ["text-primary"]: "#258cf4",
    ["text-secondary"]: "#525c67",
    ["text-tertiary"]: "#808080",
    ["text-dark"]: "#191e22",
    ["text-red"]: "#e64724",
    ["text-green"]: "#1ccb12",
    ["text-dark-green"]: "#109e0d",
    ["text-orange"]: "#ea9f27",

    ["light-blue"]: "#a2cefa",
    ["light-green"]: "#cef2d9",
    ["light-yellow"]: "#ecebd1",
    ["light-orange"]: "#fdecde",
    ["light-pink"]: "#fdd9e7",
    ["light-purple"]: "#fccbf5",
    ["light-violet"]: "#cec4e5",
    ["light-white"]: "#f9f9f9",

    ["amazon-shade"]: "#fff6ea",
    ["flipkart-shade"]: "#fff9d4",
    ["tatacliq-shade"]: "#ffdfdf",
    ["meesho-shade"]: "#fff5fa",
    ["ajio-shade"]: "#e6ebef",
    ["myntra-shade"]: "#ff9fb6",
    ["croma-shade"]: "#d7f6f2",
    ["reliance-shade"]: "#e4e4ff",
    ["shopclues-shade"]: "#dfeaec",
    ["snapdeal-shade"]: "#fee7e6",
    ["nykaa-shade"]: "#ffeaf4",

    ["box-shadow-1"]: "rgba(0, 0, 0, 0.05)",
    ["loading-gradient"]:
      "linear-gradient(110deg, #ececec 27%, #ffffff 37%, #ececec 51%)",
    ["dark-png-filter"]:
      "invert(9%) sepia(29%) saturate(317%) hue-rotate(164deg) brightness(97%) contrast(96%)",
  },
  dark: {
    ["black"]: "#fefefe",
    ["white"]: "#0b0b0b",
    ["bg-primary"]: "#258cf4",
    ["bg-secondary"]: "#62aaf3",
    ["bg-light-gray"]: "#282828",
    ["bg-medium-gray"]: "#5d5d5d",
    ["bg-dark"]: "#f2f2f2",
    ["bg-red"]: "#e64724",
    ["bg-green"]: "#1ccb12",
    ["bg-dark-green"]: "#109e0d",
    ["bg-yellow"]: "#f3e11f",
    ["bg-bluish-white"]: "#2e3032",
    ["bg-black-translucent"]: "rgba(0, 0, 0, 0.7)",

    ["text-primary"]: "#258cf4",
    ["text-secondary"]: "#d1d7df",
    ["text-tertiary"]: "#c0c0c0",
    ["text-dark"]: "#e7eef4",
    ["text-red"]: "#e64724",
    ["text-green"]: "#1ccb12",
    ["text-dark-green"]: "#5bf458",
    ["text-orange"]: "#ea9f27",

    ["light-blue"]: "#a2cefa",
    ["light-green"]: "#5a5a5a",
    ["light-yellow"]: "#c9c8b2",
    ["light-orange"]: "#d7c9bd",
    ["light-pink"]: "#d7b9c5",
    ["light-purple"]: "#afa7c3",
    ["light-violet"]: "#cec4e5",
    ["light-white"]: "#0d243c",

    ["amazon-shade"]: "#d9d1c7",
    ["flipkart-shade"]: "#d9d4b4",
    ["tatacliq-shade"]: "#d9bebe",
    ["meesho-shade"]: "#d9d0d5",
    ["ajio-shade"]: "#c4c8cb",
    ["myntra-shade"]: "#ff9fb6",
    ["croma-shade"]: "#b7d1ce",
    ["reliance-shade"]: "#c2c2d9",
    ["shopclues-shade"]: "#bec7c9",
    ["snapdeal-shade"]: "#d8c5c4",
    ["nykaa-shade"]: "#d9c7d0",

    ["box-shadow-1"]: "rgba(255, 255, 255, 0.25)",
    ["loading-gradient"]:
      "linear-gradient(110deg, #8e8e8e 29%, #bcbcbc 41%, #8e8e8e 54%)",
    ["dark-png-filter"]:
      "invert(100%) sepia(0%) saturate(1962%) hue-rotate(95deg) brightness(108%) contrast(102%)",
  },
};
