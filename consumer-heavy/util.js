const {
  allScrappersList,
  availableSortOptions,
  availableFilterOptions,
  filterTypes,
} = require("./constant.js");

const getClosingPairIndex = (str, startIndex = 0) => {
  if (!str) return;
  if (str[startIndex] != "{") return -1;

  const arr = [];
  const strLength = str.length;
  for (let i = startIndex; i < strLength; ++i) {
    if (str[i] == "{") arr.push(str[i]);
    else if (str[i] == "}") arr.pop();

    if (arr.length === 0) return i;
  }
  return -1;
};

const shopcluesPriceFilterOptions = {
  0: "P1",
  251: "P2",
  501: "P3",
  1001: "P4",
  2501: "P5",
  5001: "P6",
  10001: "P7",
  20001: "P8",
  10000000: "P8",
};

const getShopcluesPriceFilter = (lowPrice, highPrice) => {
  let low, high;
  const keys = Object.keys(shopcluesPriceFilterOptions);
  try {
    keys.forEach((item, index) => {
      parseInt(item) > lowPrice && !low
        ? (low = shopcluesPriceFilterOptions[keys[index - 1]])
        : "";

      parseInt(item) > highPrice && !high
        ? (high = shopcluesPriceFilterOptions[keys[index - 1]])
        : "";
    });
  } catch (err) {
    low = shopcluesPriceFilterOptions[0];
    high = shopcluesPriceFilterOptions[20000];
  }

  const values = Object.values(shopcluesPriceFilterOptions);
  return values.slice(
    values.findIndex((item) => item == low),
    values.findIndex((item) => item == high) + 1
  );
};

const getUrlParamForSort = (sort, scrapper) => {
  if (typeof sort !== "string") return "";
  if (!scrapper) return "";
  switch (scrapper) {
    case allScrappersList.amazon: {
      let sortParam = "";

      if (sort == availableSortOptions.featured) sortParam = "";
      else if (sort == availableSortOptions.popularity)
        sortParam = "&s=review-rank";
      else if (sort == availableSortOptions.priceLowToHigh)
        sortParam = "&s=price-asc-rank";
      else if (sort == availableSortOptions.priceHighToLow)
        sortParam = "&s=price-desc-rank";
      else if (sort == availableSortOptions.newest)
        sortParam = "&s=date-desc-rank";

      return sortParam;
    }
    case allScrappersList.flipkart: {
      let sortParam = "";

      if (sort == availableSortOptions.featured) sortParam = "&sort=relevance";
      else if (sort == availableSortOptions.popularity)
        sortParam = "&sort=popularity";
      else if (sort == availableSortOptions.priceLowToHigh)
        sortParam = "&sort=price_asc";
      else if (sort == availableSortOptions.priceHighToLow)
        sortParam = "&sort=price_desc";
      else if (sort == availableSortOptions.newest)
        sortParam = "&sort=recency_desc";

      return sortParam;
    }
    case allScrappersList.tatacliq: {
      let sortParam = "";

      if (sort == availableSortOptions.featured) sortParam = "";
      else if (sort == availableSortOptions.popularity)
        sortParam = ":relevance";
      else if (sort == availableSortOptions.priceLowToHigh)
        sortParam = ":price-asc";
      else if (sort == availableSortOptions.priceHighToLow)
        sortParam = ":price-desc";
      else if (sort == availableSortOptions.newest) sortParam = ":isProductNew";

      return sortParam;
    }
    case allScrappersList.reliance: {
      let sortParam = "";

      if (sort == availableSortOptions.featured) sortParam = "";
      else if (sort == availableSortOptions.popularity)
        sortParam = ":relevance";
      else if (sort == availableSortOptions.priceLowToHigh)
        sortParam = ":price-asc";
      else if (sort == availableSortOptions.priceHighToLow)
        sortParam = ":price-desc";
      else if (sort == availableSortOptions.newest) sortParam = "";

      return sortParam;
    }
    case allScrappersList.croma: {
      let sortParam = "";

      if (sort == availableSortOptions.featured) sortParam = ":relevance";
      else if (sort == availableSortOptions.popularity) sortParam = ":topRated";
      else if (sort == availableSortOptions.priceLowToHigh)
        sortParam = ":price-asc";
      else if (sort == availableSortOptions.priceHighToLow)
        sortParam = ":price-desc";
      else if (sort == availableSortOptions.newest)
        sortParam = ":LatestArrival";

      return sortParam;
    }
    case allScrappersList.snapdeal: {
      let sortParam = "";

      if (sort == availableSortOptions.featured) sortParam = "&sort=rlvncy";
      else if (sort == availableSortOptions.popularity)
        sortParam = "&sort=plrty";
      else if (sort == availableSortOptions.priceLowToHigh)
        sortParam = "&sort=plth";
      else if (sort == availableSortOptions.priceHighToLow)
        sortParam = "&sort=phtl";
      else if (sort == availableSortOptions.newest) sortParam = "&sort=rec";

      return sortParam;
    }
    case allScrappersList.shopclues: {
      let sortParam = "";

      if (sort == availableSortOptions.featured)
        sortParam = "&sort_by=score&sort_order=desc";
      else if (sort == availableSortOptions.popularity)
        sortParam = "&sort_by=popularity&sort_order=desc";
      else if (sort == availableSortOptions.priceLowToHigh)
        sortParam = "&sort_by=sort_price&sort_order=desc";
      else if (sort == availableSortOptions.priceHighToLow)
        sortParam = "&sort_by=sort_price&sort_order=asc";
      else if (sort == availableSortOptions.newest)
        sortParam = "&sort_by=newarrivals&sort_order=desc";

      return sortParam;
    }
    case allScrappersList.nykaa: {
      let sortParam = "";

      if (sort == availableSortOptions.featured)
        sortParam = "&sort=relevance_new";
      else if (sort == availableSortOptions.popularity)
        sortParam = "&sort=customer_top_rated";
      else if (sort == availableSortOptions.priceLowToHigh)
        sortParam = "&sort=price_asc";
      else if (sort == availableSortOptions.priceHighToLow)
        sortParam = "&sort=price_desc";
      else if (sort == availableSortOptions.newest)
        sortParam = "&sort=new_arrival";

      return sortParam;
    }
    case allScrappersList.ajio: {
      let sortParam = "";

      if (sort == availableSortOptions.featured)
        sortParam = "&query=:relevance";
      else if (sort == availableSortOptions.popularity) sortParam = "";
      else if (sort == availableSortOptions.priceLowToHigh)
        sortParam = "&query=:prce-asc";
      else if (sort == availableSortOptions.priceHighToLow)
        sortParam = "&query=:prce-desc";
      else if (sort == availableSortOptions.newest) sortParam = "&query=:newn";

      return sortParam;
    }
    default:
      return "";
  }
};

const getUrlParamForFilters = (filters = {}, scrapper) => {
  // need to recheck the filters they are not working

  if (typeof filters !== "object") return "";
  if (!scrapper) return "";
  for (let key in filters) {
    const filter = filters[key];

    switch (key) {
      case availableFilterOptions.price: {
        if (!Array.isArray(filter)) return "";
        const lowPrice = filter[0] ? parseInt(filter[0]) || 10 : 10;
        const highPrice = filter[1]
          ? parseInt(filter[1]) || 10000000
          : 10000000;
        let queryString = "";

        if (scrapper == allScrappersList.amazon)
          queryString = `&rh=p_36:${lowPrice}-${highPrice}`;
        else if (scrapper == allScrappersList.flipkart)
          queryString = `&p[]=facets.price_range.from=${lowPrice}&p[]=facets.price_range.to=${highPrice}`;
        else if (scrapper == allScrappersList.tatacliq)
          queryString = `:price:${lowPrice}-${highPrice}`;
        else if (scrapper == allScrappersList.reliance)
          queryString = `:price:[${lowPrice} TO ${highPrice}]`;
        else if (scrapper == allScrappersList.croma)
          queryString = `:price:${lowPrice} - ${highPrice}`;
        else if (scrapper == allScrappersList.snapdeal)
          queryString = `&q=Price:${lowPrice},${highPrice}|`;
        else if (scrapper == allScrappersList.shopclues)
          queryString = `&fsrc=price${getShopcluesPriceFilter(
            lowPrice,
            highPrice
          ).map((item) => `&fq[]=${item}`)}`;
        else if (scrapper == allScrappersList.nykaa)
          queryString = `&price_range_filter=${lowPrice}-${highPrice}`;
        else if (scrapper == allScrappersList.ajio)
          queryString = `:price:${lowPrice},${highPrice}`;

        return queryString;
      }
      case availableFilterOptions.gender: {
        if (!filter || !Array.isArray(filter)) return;
        let queryString = "";

        if (scrapper == allScrappersList.amazon)
          filter.forEach((item) =>
            item == filterTypes.gender.men
              ? (queryString += ` for men`)
              : item == filterTypes.gender.women
              ? (queryString += ` for women`)
              : ""
          );
        else if (scrapper == allScrappersList.flipkart)
          filter.forEach((item) =>
            item == filterTypes.gender.men
              ? (queryString += `&p[]=facets.ideal_for[]=Men`)
              : item == filterTypes.gender.women
              ? (queryString += `&p[]=facets.ideal_for[]=Women`)
              : ""
          );
        else if (scrapper == allScrappersList.ajio)
          filter.forEach((item) =>
            item == filterTypes.gender.men
              ? (queryString += `:genderfilter:Men`)
              : item == filterTypes.gender.women
              ? (queryString += `:genderfilter:Women`)
              : ""
          );
        else if (scrapper == allScrappersList.tatacliq)
          filter.forEach((item) =>
            item == filterTypes.gender.men
              ? (queryString += `:category:MSH11`)
              : item == filterTypes.gender.women
              ? (queryString += `:category:MSH10`)
              : ""
          );
        else if (scrapper == allScrappersList.snapdeal)
          filter.forEach((item) =>
            item == filterTypes.gender.men
              ? (queryString += `&q=Gender_s:Men|`)
              : item == filterTypes.gender.women
              ? (queryString += `&q=Gender_s:Women|`)
              : ""
          );
        else if (scrapper == allScrappersList.meesho)
          filter.forEach((item) =>
            item == filterTypes.gender.men
              ? (queryString += ` for men`)
              : item == filterTypes.gender.women
              ? (queryString += ` for women`)
              : ""
          );
        else if (scrapper == allScrappersList.shopclues)
          filter.forEach((item) =>
            item == filterTypes.gender.men
              ? (queryString += ` for men`)
              : item == filterTypes.gender.women
              ? (queryString += ` for women`)
              : ""
          );

        return queryString;
      }
      case availableFilterOptions.size: {
        if (!filter || !Array.isArray(filter)) return;
        let queryString = "";

        if (scrapper == allScrappersList.flipkart)
          filter.forEach((item) =>
            filterTypes.size[item]
              ? (queryString += `&p[]=facets.size[]=${filterTypes.size[item]}`)
              : ""
          );
        else if (scrapper == allScrappersList.ajio)
          filter.forEach((item) =>
            item == "XXL"
              ? (queryString += `:verticalsizegroupformat:XXL`)
              : filterTypes.size[item]
              ? (queryString += `:verticalsizegroupformat:${filterTypes.size[item]}`)
              : ""
          );
        else if (scrapper == allScrappersList.tatacliq)
          filter.forEach((item) =>
            filterTypes.size[item]
              ? (queryString += `:size:${filterTypes.size[item]}`)
              : ""
          );

        return queryString;
      }

      default:
        return "";
    }
  }
  return "";
};

module.exports = {
  getClosingPairIndex,
  getUrlParamForFilters,
  getUrlParamForSort,
};
