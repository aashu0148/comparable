import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import {
  getElectronicProducts,
  getFashionProducts,
  getGeneralProducts,
  getCustomProducts,
  getSuggestions,
} from "api/search/search";
import {
  allScrappersList,
  availableCategories,
  availableSortOptions,
  searchPageViewTypes,
} from "constants.js";
import {
  findRelevancyScore,
  extractNumberFromStringWithLimit,
  extractIntegerFromString,
} from "util.js";

import styles from "./Search.module.scss";

let currentResponseKey = "",
  timeout;
function SearchHelper(props) {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  let category = params.category;
  if (!Object.values(availableCategories).includes(category)) category = "";
  const isCustomCategory = category == availableCategories.custom;
  const { connectionId, blurInputBox } = props;

  const [inputValue, setInputValue] = useState("");
  const [lastSearchValue, setLastSearchValue] = useState("");
  const [showSuggestionDropdown, setShowSuggestionDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState({
    isLoading: false,
    data: [],
  });
  const [isFetchingResults, setIsFetchingResults] = useState(false);
  const [inputErrorMsg, setInputErrorMsg] = useState("");
  const [result, setResult] = useState({});
  const [showSecondSpinner, setShowSecondSpinner] = useState(false);
  const [expectedResults, setExpectedResults] = useState([]);
  const [cheapest, setCheapest] = useState({});
  const [inAppSortDropdown, setInAppSortDropdown] = useState(false);
  const [globalSortDropdown, setGlobalSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState({
    globalSort: "",
    inAppSort: `${availableSortOptions.relevance}`,
  });
  const [isFilterModal, setIsFilterModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(
    JSON.parse(sessionStorage.getItem(`${category}filters`)) || {}
  );
  const [customArray, setCustomArray] = useState([]);
  const cachedSearchView = localStorage.getItem(`searchView_${category}`);
  const [selectedSearchView, setSelectedSearchView] = useState(
    Object.values(searchPageViewTypes).includes(cachedSearchView)
      ? cachedSearchView
      : category == availableCategories.fashion
      ? searchPageViewTypes.deckView
      : searchPageViewTypes.scrolling
  );
  const [infoSection, setInfoSection] = useState({
    class: "",
  });

  const debounce = (func, timer = 200) => {
    clearTimeout(timeout);
    timeout = setTimeout(func, timer);
  };

  const handleInfoDetails = (from) => {
    if (!from) return;
    let className = "";

    switch (from) {
      case allScrappersList.amazon: {
        className = styles.amazonContainer;
        break;
      }
      case allScrappersList.flipkart: {
        className = styles.flipkartContainer;
        break;
      }
      case allScrappersList.ajio: {
        className = styles.ajioContainer;
        break;
      }
      case allScrappersList.nykaa: {
        className = styles.nykaaContainer;
        break;
      }
      case allScrappersList.tatacliq: {
        className = styles.tatacliqContainer;
        break;
      }
      case allScrappersList.reliance: {
        className = styles.relianceContainer;
        break;
      }
      case allScrappersList.croma: {
        className = styles.cromaContainer;
        break;
      }
      case allScrappersList.meesho: {
        className = styles.meeshoContainer;
        break;
      }
      case allScrappersList.snapdeal: {
        className = styles.snapdealContainer;
        break;
      }
      case allScrappersList.shopclues: {
        className = styles.shopcluesContainer;
        break;
      }
    }

    setInfoSection({
      class: className,
    });
  };

  const compareBasedOnPriceAndTitle = (item1, item2) => {
    if (typeof item1 !== "object" || typeof item2 !== "object") return false;

    const priceDifference = Math.abs(item1.price - item2.price);
    const maxPrice = item1.price > item2.price ? item1.price : item2.price;
    if (priceDifference > 0.25 * maxPrice) return false;

    // just taking first 13 words of the title as all the key details should be within 13 words
    const title1 = item1.title.split(" ").slice(0, 13).join(" ");
    const title2 = item2.title.split(" ").slice(0, 13).join(" ");

    let score = 0;
    if (title1.length < title2.length)
      score = findRelevancyScore(title1, [title2])[0];
    else score = findRelevancyScore(title2, [title1])[0];
    if (score < 0.88) return false;

    return true;
  };

  const getCheapestProduct = (data = result) => {
    if (typeof data !== "object") return {};
    if (Object.keys(data).length === 0) return {};

    const groupedResults = {};
    for (let key in data) {
      const value = data[key];
      const titles = value.map((item) => item.title);
      const scores = findRelevancyScore(lastSearchValue, titles);
      let sumPrice = 0;
      value.forEach((item, index) => {
        sumPrice = item.price + sumPrice;
        item.score = parseFloat(scores[index]);
      });
      const halfOfAveragePrice = sumPrice / (value.length * 2);
      const roughlyFiltered = value.filter(
        (item) =>
          item.price &&
          item.price > halfOfAveragePrice &&
          item.score > 0.55 &&
          !item.title.includes("efurbished") &&
          !item.title.includes("enewed")
      );
      const platformGroupedResults = [];

      for (let i = 0; i < roughlyFiltered.length; ++i) {
        const mainElem = roughlyFiltered[i];
        const groupArr = [];
        for (let j = i; j < roughlyFiltered.length; ++j) {
          const targetElem = roughlyFiltered[j];
          if (compareBasedOnPriceAndTitle(mainElem, targetElem))
            groupArr.push(targetElem);
        }
        if (groupArr.length > 1)
          platformGroupedResults.push({
            group: groupArr,
            groupScore:
              findRelevancyScore(
                lastSearchValue,
                groupArr.map((item) => item.title)
              ).reduce((acc, item) => acc + item, 0) / groupArr.length,
          });
      }

      if (platformGroupedResults.length > 0) {
        let sumPrice = 0,
          length = 0;
        platformGroupedResults.forEach((group) =>
          group.group.forEach((item) => {
            sumPrice += item.price;
            ++length;
          })
        );
        const avgPrice = sumPrice / length;

        // if we are not able to group atleast 25% of roughlyFiltered results then the results may be generic and should be excluded
        if (0.25 * roughlyFiltered.length < length) {
          groupedResults[key] = {
            groups: platformGroupedResults,
            average: avgPrice,
          };
        }
      }
    }

    if (Object.keys(groupedResults).length < 3) return {};
    let cheapestProductPrice = Number.MAX_SAFE_INTEGER,
      cheapestProduct = {};
    const groupedResultValues = Object.values(groupedResults);
    const averagePrice =
      groupedResultValues.reduce((acc, item) => acc + item.average, 0) /
      groupedResultValues.length;
    const offsetAveragePrice = averagePrice - averagePrice / 4;

    groupedResultValues.forEach((result) =>
      result.average > offsetAveragePrice
        ? result.groups.forEach((subGroup) =>
            subGroup.groupScore > 0.88
              ? subGroup.group.forEach((item) => {
                  if (item.price < cheapestProductPrice) {
                    cheapestProductPrice = item.price;
                    cheapestProduct = { ...item };
                  }
                })
              : ""
          )
        : ""
    );
    handleInfoDetails(cheapestProduct.from);
    return cheapestProduct;
  };

  const handleInAppSort = (sort, data = result) => {
    if (!sort) return;
    const dummysort = {
      ...sortBy,
      inAppSort: sort,
    };

    if (typeof data !== "object") return [];
    if (Object.keys(data).length === 0) return [];

    if (sort === `${availableSortOptions.priceLowToHigh}`) {
      for (let key in data) {
        const value = data[key];
        value.sort((a, b) =>
          a.price < b.price ? -1 : a.price == b.price ? 0 : 1
        );
      }
      setResult(data);
    } else if (sort === `${availableSortOptions.priceHighToLow}`) {
      for (let key in data) {
        const value = data[key];
        value.sort((a, b) =>
          a.price > b.price ? -1 : a.price == b.price ? 0 : 1
        );
      }
      setResult(data);
    } else if (sort === `${availableSortOptions.ratings}`) {
      for (let key in data) {
        const value = data[key];
        value.forEach((item) => {
          const reviews = item?.ratings?.totalReviews
            ? extractNumberFromStringWithLimit(item?.ratings?.totalReviews)
            : "";
          const ratings = {
            totalReviews: reviews,
            rating: item?.ratings?.rating,
          };
          item.ratings = ratings;
        });
        value.sort((a, b) =>
          extractIntegerFromString(a?.ratings?.totalReviews) >
          extractIntegerFromString(b?.ratings?.totalReviews)
            ? -1
            : extractIntegerFromString(a?.ratings?.totalReviews) ==
              extractIntegerFromString(b?.ratings?.totalReviews)
            ? 0
            : 1
        );
      }
      setResult(data);
    } else if (sort === `${availableSortOptions.relevance}`) {
      for (let key in data) {
        const value = data[key];
        const titles = value.map((item) => item.title);
        const scores = findRelevancyScore(lastSearchValue, titles);
        let sumPrice = 0;
        value.forEach((item, index) => {
          sumPrice = item.price + sumPrice;
          item.score = parseFloat(scores[index]);
        });
        const halfOfAveragePrice = sumPrice / (value.length * 2);

        value.sort((a, b) => {
          if (a.price < halfOfAveragePrice && b.price > halfOfAveragePrice)
            return 1;
          if (b.price < halfOfAveragePrice && a.price > halfOfAveragePrice)
            return -1;
          if (a.score == b.score)
            return a.price < b.price ? -1 : a.price == b.price ? 0 : 1;

          return a.score > b.score ? -1 : 1;
        });
      }
      setResult(data);
    }

    setSortBy(dummysort);
    setInAppSortDropdown(false);
  };

  const handleGlobalSort = (value, requestedFrom = []) => {
    if (!value) return;
    const dummysort = {
      ...sortBy,
      globalSort: value,
    };
    setSortBy(dummysort);
    handleProductSearch(value, {}, requestedFrom, inputValue);
    setGlobalSortDropdown(false);
  };

  const handleInputChange = (value) => {
    setInputValue(value);
    setShowSuggestionDropdown(true);
    debounce(() => fetchSuggestions(value), 300);
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestionDropdown(false);
    setInputValue(suggestion);
    handleProductSearch("", "", customArray, suggestion);
  };

  const fetchSuggestions = (value) => {
    if (!value) return;
    setSuggestions({ isLoading: true, data: [] });
    getSuggestions(value, connectionId).then((res) => {
      if (!res) {
        setSuggestions((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      setSuggestions({
        isLoading: false,
        data: res.data,
      });
    });
  };

  const handleProductSearch = async (
    sort = "",
    filters = {},
    requestedFrom = [],
    inputValue = inputValue
  ) => {
    if (isFetchingResults) return;
    if (!inputValue) {
      setInputErrorMsg("Enter something to search");
      return;
    }
    navigate(`/search/${category}/${inputValue.toLowerCase()}`);
    setShowSecondSpinner((prev) => !prev);
    setInputErrorMsg("");
    setResult({});
    setLastSearchValue(inputValue.toLowerCase());
    setIsFetchingResults(true);
    setShowSuggestionDropdown(false);
    if (blurInputBox) blurInputBox();

    let res;
    switch (category) {
      case availableCategories.general: {
        res = await getGeneralProducts(inputValue, sort, filters, connectionId);
        break;
      }
      case availableCategories.fashion: {
        res = await getFashionProducts(inputValue, sort, filters, connectionId);
        break;
      }
      case availableCategories.electronics: {
        res = await getElectronicProducts(
          inputValue,
          sort,
          filters,
          connectionId
        );
        break;
      }
      case availableCategories.custom: {
        res = await getCustomProducts(
          inputValue,
          sort,
          filters,
          requestedFrom,
          connectionId
        );
        break;
      }
      default:
        res = await getGeneralProducts(inputValue, sort, filters, connectionId);
    }
    if (!res) {
      setIsFetchingResults(false);
      return;
    }

    const expectedFrom = res.data?.expectedFrom;
    setExpectedResults(expectedFrom);
    currentResponseKey = res.data?.responseKey;
  };

  const handleSocketData = async (data) => {
    const resKey = data?.responseKey;

    if (currentResponseKey !== resKey) return;
    setIsFetchingResults(false);
    if (data.isOfferDetails) {
      const from = data.from;
      if (Array.isArray(data.offers))
        setResult((prev) => {
          const target = prev[allScrappersList[from]];
          const offers = [...data.offers];

          if (!target) return prev;
          offers.forEach((item) => {
            const elem = target.find((elem) => elem.id == item.id);
            if (elem) elem.offers = item.result;
          });
          target.forEach((item) => {
            item.offersLoaded = true;
          });

          return { ...prev };
        });

      return;
    }
    const from = data.from || "";
    const resultedArr = Array.isArray(data.result)
      ? data.result.map((item) => {
          let price = item.price + "";
          price = (price.match(/[0123456789.]/g) || []).join("");
          price = parseInt(price || 0) || 0;

          if (
            from === allScrappersList.flipkart &&
            Array.isArray(item?.keySpecs) &&
            item.keySpecs.length > 1
          ) {
            const tempSpecs = [...item.keySpecs];
            const firstSpec = item.keySpecs[0];
            const secondSpec = tempSpecs[1];
            item.title += ` - ${firstSpec}`;
            tempSpecs.splice(1, 1);
            item.keySpecs = [secondSpec, ...tempSpecs];
          }

          return {
            ...item,
            price,
            formattedPrice:
              price > 0
                ? price.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                    style: "currency",
                    currency: "INR",
                  })
                : "Nan",
            from,
          };
        })
      : [];

    const tempResult = {
      [allScrappersList[from]]: resultedArr,
    };
    setResult((prev) => ({ ...prev, ...tempResult }));
  };

  const handleCustomSearch = (storeName) => {
    if (!storeName) return;

    const dummyCustom = [...customArray];

    const index = dummyCustom.indexOf(storeName);

    if (customArray.length === 5 && index < 0) {
      return;
    }

    if (index >= 0) {
      dummyCustom.splice(index, 1);
      setCustomArray(dummyCustom);
      return;
    }

    dummyCustom.push(storeName);
    setCustomArray(dummyCustom);
    setInputValue("");
  };

  const handleCustomSearchChange = () => {
    setCustomArray([]);
    setResult({});
    sessionStorage.removeItem(`${category}filters`);
    setAppliedFilters(JSON.parse(sessionStorage.getItem("")));
    setAppliedFilters({});
  };

  useEffect(() => {
    const cachedSearchView = localStorage.getItem(`searchView_${category}`);
    if (selectedSearchView == cachedSearchView) return;
    localStorage.setItem(`searchView_${category}`, selectedSearchView);
  }, [selectedSearchView]);

  useEffect(() => {
    if (isFetchingResults) return;
    let cachedResults;
    try {
      cachedResults = JSON.parse(sessionStorage.getItem("results"));
    } catch (err) {
      cachedResults = "";
      console.error("Error in json parse ", err);
    }
    if (typeof cachedResults !== "object" || !cachedResults) return;

    const pathname = decodeURI(location.pathname);
    const splits = pathname.split("/");
    const query = splits[3];

    const requiredResult = cachedResults[query];
    if (typeof requiredResult?.data !== "object" || !requiredResult?.data)
      return;

    setInputValue(query);
    setLastSearchValue(query);
    setExpectedResults(requiredResult?.expectedFrom);
    setResult(requiredResult.data);
  }, [location]);

  return {
    state: {
      category,
      isCustomCategory,
      isFetchingResults,
      isFilterModal,
      infoSection,
      inputValue,
      lastSearchValue,
      selectedSearchView,
      customArray,
      appliedFilters,
      globalSortDropdown,
      inAppSortDropdown,
      cheapest,
      expectedResults,
      showSecondSpinner,
      inputErrorMsg,
      sortBy,
      result,
      appliedFilters,
      customArray,
      suggestions,
      showSuggestionDropdown,
      setShowSuggestionDropdown,
      setSelectedSearchView,
      setAppliedFilters,
      setInAppSortDropdown,
      setIsFilterModal,
      setCheapest,
      setInputValue,
      setGlobalSortDropdown,
    },
    func: {
      handleCustomSearch,
      handleSocketData,
      handleGlobalSort,
      handleInAppSort,
      getCheapestProduct,
      handleProductSearch,
      handleCustomSearchChange,
      handleInputChange,
      handleSuggestionClick,
    },
  };
}

export default SearchHelper;
