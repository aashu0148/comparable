import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import ReactDOM from "react-dom";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Search,
  WifiOff,
  X,
} from "react-feather";
import { io } from "socket.io-client";

import { Button } from "components/Button";
import Dropdown from "components/Dropdown/Dropdown";
import Spinner from "components/Spinner/Spinner";
import ProgressBar from "components/ProgressBar/ProgressBar";
import EcomerceResultCard from "components/EcomerceResultCard/EcomerceResultCard";

import {
  allScrappersList,
  logoMappingWithScrapper,
  offerScrappersList,
  platformNames,
} from "utils/constants";
import { getConnection } from "api/connection";
import {
  getEcomerceProducts,
  getEcomerceProductSuggestions,
} from "api/ecomerce";
import { findRelevancyScore } from "utils/util";

import styles from "./EcomercePage.module.scss";

let socket;
let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
let timeout;
function EcomercePage() {
  const availablePlatforms = [
    {
      label: "Amazon",
      value: allScrappersList.amazon,
      logo: logoMappingWithScrapper[allScrappersList.amazon].square,
      demand: 1,
    },
    {
      label: "Flipkart",
      value: allScrappersList.flipkart,
      logo: logoMappingWithScrapper[allScrappersList.flipkart].square,
      demand: 2,
    },
    {
      label: "Myntra",
      value: allScrappersList.myntra,
      logo: logoMappingWithScrapper[allScrappersList.myntra].square,
      demand: 1,
    },
    {
      label: "Ajio",
      value: allScrappersList.ajio,
      logo: logoMappingWithScrapper[allScrappersList.ajio].square,
      demand: 4,
    },
    {
      label: "Croma",
      value: allScrappersList.croma,
      logo: logoMappingWithScrapper[allScrappersList.croma].square,
      demand: 5,
    },
    {
      label: "TataCliq",
      value: allScrappersList.tatacliq,
      logo: logoMappingWithScrapper[allScrappersList.tatacliq].square,
      demand: 6,
    },
    {
      label: "Reliance",
      value: allScrappersList.reliance,
      logo: logoMappingWithScrapper[allScrappersList.reliance].square,
      demand: 7,
    },
    {
      label: "Nykaa",
      value: allScrappersList.nykaa,
      logo: logoMappingWithScrapper[allScrappersList.nykaa].square,
      demand: 8,
    },
    {
      label: "Meesho",
      value: allScrappersList.meesho,
      logo: logoMappingWithScrapper[allScrappersList.meesho].square,
      demand: 9,
    },
    {
      label: "Shopclues",
      value: allScrappersList.shopclues,
      logo: logoMappingWithScrapper[allScrappersList.shopclues].square,
      demand: 1,
    },
    {
      label: "Snapdeal",
      value: allScrappersList.snapdeal,
      logo: logoMappingWithScrapper[allScrappersList.snapdeal].square,
      demand: 1,
    },
  ];
  const electronicsPlatforms = [
    allScrappersList.amazon,
    allScrappersList.reliance,
    allScrappersList.flipkart,
    allScrappersList.croma,
  ];
  const fashionPlatforms = [
    allScrappersList.meesho,
    allScrappersList.myntra,
    allScrappersList.ajio,
    allScrappersList.tatacliq,
    allScrappersList.nykaa,
  ];
  const availableSortOptions = {
    relevant: "Relevant",
    priceLowToHigh: "Price Low to High",
    priceHighToLow: "Price High to Low",
  };
  const searchBoxRef = useRef();
  const searchInputRef = useRef();

  const [pageLoaded, setPageLoaded] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentSort, setCurrentSort] = useState(availableSortOptions.relevant);
  const [globalError, setGlobalError] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [connectionId, setConnectionId] = useState("");
  const [isConnectedToSocket, setIsConnectedToSocket] = useState("");
  const [currentRequestData, setCurrentRequestData] = useState({});
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [products, setProducts] = useState({});
  const [productsAccToSection, setProductsAccToSection] = useState([]);
  const [selectedSection, setSelectedSection] = useState("all");
  const [sections, setSections] = useState([]);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [lastSearchValue, setLastSearchValue] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  const remainingFrom =
    currentRequestData.expectedFrom?.length > 0
      ? currentRequestData.expectedFrom?.filter((item) =>
          products[item] ? false : true
        )
      : [];

  const debounce = (func, timer = 300) => {
    clearTimeout(timeout);
    timeout = setTimeout(func, timer);
  };

  const fetchConnection = async () => {
    const res = await getConnection();
    setPageLoaded(true);
    if (!res) {
      setGlobalError("Error making connection with server!");
      return;
    }
    const connectionId = res.data?.connectionId;
    if (!connectionId) {
      setGlobalError("Can't establish connection!");
      return;
    }
    setConnectionId(connectionId);
    socket = io.connect(`${backendUrl}/${connectionId}`);
    listenToConnection();
  };

  const listenToConnection = () => {
    socket.on("connect", function () {
      setIsConnectedToSocket(true);
    });
    socket.on("disconnect", function () {
      setIsConnectedToSocket(socket.connected);
    });
  };

  const handleDataFromSocket = async (data) => {
    const resKey = data?.responseKey;
    let currReqData;
    flushSync(() =>
      setCurrentRequestData((prev) => {
        currReqData = prev;
        return prev;
      })
    );
    if (!currReqData.responseKey || currReqData.responseKey !== resKey) return;
    setFetchingProducts(false);

    if (data.isOfferDetails) {
      const from = data.from;
      if (Array.isArray(data.offers))
        setProducts((prev) => {
          const target = prev[allScrappersList[from]];
          const offers = [...data.offers];
          if (!target) return prev;
          offers.forEach((item) => {
            const elem = target.find((elem) => elem.id == item.id);
            if (elem) elem.offers = item.result || [];
          });

          target.forEach((item) => {
            item.offersLoaded = true;
            if (!item.offers && item.offersPresent) item.offers = [];
          });
          return { ...prev };
        });

      return;
    }

    const from = data.from || "";
    const resultedArr = Array.isArray(data.result)
      ? data.result.map((item) => {
          let price = parseInt(item.price) || 0;

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
                    maximumFractionDigits: 0,
                    style: "currency",
                    currency: "INR",
                  })
                : "Nan",
            from,
          };
        })
      : [];

    resultedArr.forEach((item) => {
      if (offerScrappersList.some((e) => e == from)) item.offersPresent = true;
      else item.offersPresent = false;
    });

    const tempProduct = {
      [allScrappersList[from]]: resultedArr,
    };
    setProducts((prev) => ({ ...prev, ...tempProduct }));
  };

  const fetchProducts = async (
    input,
    selected = selectedPlatforms,
    doNotSetReqData = false
  ) => {
    const res = await getEcomerceProducts(input, "", selected, connectionId);
    if (!res?.data) {
      setErrorMsg(res.message || "Error making request");
      return;
    }

    setLastSearchValue(input);
    if (!doNotSetReqData) setCurrentRequestData(res.data);
    return res.data;
  };

  const handleFetchAgain = async (from) => {
    if (from == "all") {
      handleSearchButtonClick();
      return;
    }
    if (!lastSearchValue.trim()) return;

    const tempProducts = { ...products };
    delete tempProducts[from];
    setProducts(tempProducts);

    const data = await fetchProducts(lastSearchValue, [from]);
    if (!data) return;
    setCurrentRequestData((prev) => ({
      ...prev,
      responseKey: data.responseKey,
    }));
  };

  const handleSearchButtonClick = async (inputValue = searchInputValue) => {
    if (!inputValue.trim()) return;
    setCurrentRequestData({});
    setProducts({});
    setFetchingProducts(true);
    setSections([]);
    setSelectedSection("all");
    setShowSuggestionModal(false);
    const data = await fetchProducts(inputValue);
    if (!data) return;

    setSections(["all", "combined", ...data.expectedFrom]);
  };

  const handleSectionChange = (section, sort = currentSort) => {
    let data = [];
    switch (section) {
      case "all": {
        Object.values(products).forEach((item) => {
          data.push(...item);
        });
        break;
      }
      default:
        data = products[section] ? products[section] : [];
    }

    const sortedProducts = sortProducts(sort, data);
    setSelectedSection(section);
    setProductsAccToSection(sortedProducts);
  };

  const toggleSelectedPlatforms = (value) => {
    if (!value) return;

    const tempSelectedPlatforms = [...selectedPlatforms];
    const index = tempSelectedPlatforms.findIndex((p) => p == value);

    if (index > -1) {
      tempSelectedPlatforms.splice(index, 1);
    } else {
      tempSelectedPlatforms.push(value);
    }

    setSelectedPlatforms(tempSelectedPlatforms);
  };

  const handleSearchInputChange = (val) => {
    setSearchInputValue(val);

    if (!val.trim()) {
      setShowSuggestionModal(false);
      return;
    }

    setShowSuggestionModal(true);
    setSuggestions([]);
    debounce(() => fetchSuggestions(val.trim()), 500);
  };

  const fetchSuggestions = async (input) => {
    setSuggestionsLoading(true);
    const res = await getEcomerceProductSuggestions(input, connectionId);
    if (!res?.data) return;

    setSuggestionsLoading(false);
    setSuggestions(res.data);
  };

  const sortProducts = (sort, data = []) => {
    if (!sort || !data.length) return [];
    if (typeof products !== "object") return [];

    const tempProducts = { ...products };
    if (Object.keys(tempProducts).length === 0) return [];

    if (sort === `${availableSortOptions.priceLowToHigh}`) {
      data.sort((a, b) =>
        a.price < b.price ? -1 : a.price == b.price ? 0 : 1
      );
    } else if (sort === `${availableSortOptions.priceHighToLow}`) {
      data.sort((a, b) =>
        a.price > b.price ? -1 : a.price == b.price ? 0 : 1
      );
    } else if (sort === `${availableSortOptions.relevant}`) {
      const titles = data.map((item) => item.title);
      const scores = findRelevancyScore(lastSearchValue, titles);
      let sumPrice = 0;
      data.forEach((item, index) => {
        sumPrice = item.price + sumPrice;
        item.score = parseFloat(scores[index]);
      });
      const halfOfAveragePrice = sumPrice / (data.length * 2);

      data.sort((a, b) => {
        if (
          a.title.toLowerCase().includes("renewed") ||
          a.title.toLowerCase().includes("refurbish")
        )
          return 1;
        if (a.price < halfOfAveragePrice && b.price > halfOfAveragePrice)
          return 1;
        if (b.price < halfOfAveragePrice && a.price > halfOfAveragePrice)
          return -1;
        if (a.score == b.score)
          return a.price < b.price ? -1 : a.price == b.price ? 0 : 1;

        return a.score > b.score ? -1 : 1;
      });
    }

    return data;
  };

  const handleSortChange = async (sort) => {
    setCurrentSort(sort);
    setShowSortDropdown(false);
    handleSectionChange(selectedSection, sort);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("data", handleDataFromSocket);

    return () => {
      if (socket) socket.off("data", handleDataFromSocket);
    };
  }, [socket]);

  useEffect(() => {
    // console.log(
    //   Object.values(products)
    //     .reduce((acc, curr) => [...acc, ...curr], [])
    //     .map((item) => item.title)
    // );
    if (Object.keys(products).length > 0) handleSectionChange(selectedSection);
  }, [products]);

  useEffect(() => {
    fetchConnection();

    return () => {
      if (socket?.connected) {
        socket.disconnect();
        socket.close();
      }
    };
  }, []);

  // console.log(products);

  return (
    <div className={styles.container}>
      {typeof window !== "undefined" && isConnectedToSocket === false
        ? ReactDOM.createPortal(
            <div className={styles.connectionLost}>
              <div className={styles.top}>
                <WifiOff />
                <p>Connection lost</p>
              </div>
              <p className={styles.desc}>Trying to re-connect</p>
            </div>,
            document.body
          )
        : ""}

      <div className={styles.header}>
        <div className={styles.left}>
          <p className={styles.title}>
            Shop with great{" "}
            <span>
              value
              <img src="/images/headerSmileVector.svg" alt=":)" />
            </span>
          </p>
          <p className={styles.desc}>
            Get you favorite Electronics, fashion deals from 10 different
            platforms, all compared at once with Comparable. These platforms
            also includes amazon, flipkart, myntra etc.
          </p>
          <Button
            withArrow
            onClick={() =>
              searchBoxRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Search now
          </Button>
        </div>
        <div className={styles.right}>
          <img src="/images/ecomerceShoppingImage.png" alt="Comparable Image" />
        </div>
      </div>

      <div ref={searchBoxRef} />

      {pageLoaded ? (
        globalError ? (
          <div className={styles.globalError}>
            <p className="error-msg">{globalError}</p>
            <p className={styles.desc}>
              Please check Your internet connection once
            </p>
            <Button onClick={() => window.location.reload()}>Refresh?</Button>
          </div>
        ) : (
          <>
            <div className={styles.searchBox}>
              <div className={styles.tags}>
                <div
                  className={`${styles.tag} ${
                    selectedPlatforms.length == electronicsPlatforms.length &&
                    selectedPlatforms.filter(
                      (p) => !electronicsPlatforms.includes(p)
                    ).length == 0
                      ? styles.selected
                      : ""
                  }`}
                  onClick={() => setSelectedPlatforms(electronicsPlatforms)}
                >
                  Electronics
                </div>
                <div
                  className={`${styles.tag} ${
                    selectedPlatforms.length == fashionPlatforms.length &&
                    selectedPlatforms.filter(
                      (p) => !fashionPlatforms.includes(p)
                    ).length == 0
                      ? styles.selected
                      : ""
                  }`}
                  onClick={() => setSelectedPlatforms(fashionPlatforms)}
                >
                  Fashion
                </div>
              </div>

              <div className={styles.platformsContainer}>
                <div className={styles.platforms}>
                  {[
                    ...availablePlatforms.filter((item) =>
                      selectedPlatforms.includes(item.value)
                    ),
                    ...availablePlatforms.filter(
                      (item) => !selectedPlatforms.includes(item.value)
                    ),
                  ].map((item) => (
                    <div
                      className={`${styles.platform} ${
                        selectedPlatforms.some((p) => p == item.value)
                          ? styles.selected
                          : ""
                      }`}
                      key={item.value}
                      onClick={() => toggleSelectedPlatforms(item.value)}
                    >
                      <img src={item.logo} alt={item.label} />
                      <p className={styles.title}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPlatforms.length > 1 && (
                <div className={styles.search}>
                  <div className={styles.searchIcon}>
                    <Search />
                  </div>
                  <input
                    ref={searchInputRef}
                    className="basic-input"
                    placeholder="Enter product name"
                    onChange={(event) =>
                      handleSearchInputChange(event.target.value)
                    }
                    value={searchInputValue}
                    onFocus={() =>
                      suggestions.length > 0 ? setShowSuggestionModal(true) : ""
                    }
                  />
                  {searchInputValue && (
                    <div
                      className={`icon`}
                      onClick={() => {
                        setSearchInputValue("");
                        setShowSuggestionModal(false);
                      }}
                    >
                      <X />
                    </div>
                  )}

                  <Button
                    className={isConnectedToSocket ? "" : styles.connecting}
                    onClick={() => handleSearchButtonClick()}
                    disabled={!isConnectedToSocket || fetchingProducts}
                  >
                    {isConnectedToSocket ? "Search" : "Connecting..."}
                  </Button>

                  {showSuggestionModal && (
                    <Dropdown
                      className={styles.suggestions}
                      onClose={() => setShowSuggestionModal(false)}
                    >
                      {suggestionsLoading ? (
                        <div className={styles.suggestion}>
                          <p>
                            <b>Loading...</b>
                          </p>
                        </div>
                      ) : (
                        suggestions.map((item) => (
                          <div
                            className={styles.suggestion}
                            key={item}
                            onClick={() => {
                              setShowSuggestionModal(false);
                              setSearchInputValue(item);
                              handleSearchButtonClick(item);
                            }}
                          >
                            <p>{item}</p>
                            <div
                              className="icon"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSearchInputValue(item);
                                setShowSuggestionModal(false);
                                searchInputRef.current?.focus();
                              }}
                            >
                              <ArrowUpRight />
                            </div>
                          </div>
                        ))
                      )}
                    </Dropdown>
                  )}
                </div>
              )}
            </div>

            <div className={styles.searchResults}>
              {currentRequestData?.expectedFrom ? (
                <div className={styles.head}>
                  <p className={styles.title}>{currentRequestData.search}</p>

                  <Button
                    outlineButton
                    className={styles.sortButton}
                    onClick={() => setShowSortDropdown((prev) => !prev)}
                  >
                    {currentSort}
                    {showSortDropdown ? <ChevronUp /> : <ChevronDown />}
                    {showSortDropdown && (
                      <Dropdown
                        className={styles.list}
                        startFromRight
                        onClose={() => setShowSortDropdown(false)}
                      >
                        {Object.keys(availableSortOptions).map((key) => (
                          <p
                            className={styles.item}
                            key={key}
                            onClick={() =>
                              handleSortChange(availableSortOptions[key])
                            }
                          >
                            {availableSortOptions[key]}
                          </p>
                        ))}
                      </Dropdown>
                    )}
                  </Button>
                </div>
              ) : (
                ""
              )}
              <div className={styles.topDiv}>
                <div className={styles.sectionsContainer}>
                  <div className={styles.sections}>
                    {sections.map((item) => (
                      <div
                        key={item}
                        className={`${styles.section} ${
                          item == selectedSection ? styles.selected : ""
                        }`}
                        onClick={() => handleSectionChange(item)}
                      >
                        {platformNames[item] || item}
                      </div>
                    ))}
                  </div>
                </div>

                {remainingFrom.length > 0 ? (
                  <div className={styles.loadingResults}>
                    <div className={styles.top}>
                      <Spinner small />{" "}
                      <p>
                        Getting results from{" "}
                        <span>{remainingFrom.join(", ")}</span>
                      </p>
                    </div>
                    <ProgressBar
                      progress={
                        100 -
                        (remainingFrom.length /
                          currentRequestData.expectedFrom.length) *
                          100
                      }
                    />
                  </div>
                ) : (
                  ""
                )}
              </div>

              {Object.keys(products).length > 0 ? (
                <div className={styles.cards}>
                  {productsAccToSection.length == 0 ? (
                    remainingFrom.includes(selectedSection) ? (
                      <div className={styles.spinner}>
                        <Spinner />
                      </div>
                    ) : selectedSection == "combined" ? (
                      <div className={styles.empty}>
                        <p className={styles.title}>
                          Not able to combine results 😥
                        </p>
                      </div>
                    ) : (
                      <div className={styles.empty}>
                        {/* <img src="/images/sadSearchIcon.png" alt="_" /> */}
                        <img src="/images/emptyBoxIcon.png" alt="_" />
                        <p className={styles.title}>No Products found</p>
                        <p className={styles.desc}>
                          If you think that the platform must have results for
                          what you searched for then try fetching again.
                        </p>
                        <Button
                          onClick={() => handleFetchAgain(selectedSection)}
                        >
                          Fetch again ?
                        </Button>
                      </div>
                    )
                  ) : (
                    productsAccToSection.map((item) => (
                      <EcomerceResultCard key={item.id} details={item} />
                    ))
                  )}
                </div>
              ) : fetchingProducts ? (
                <div className={styles.spinner}>
                  <Spinner />
                </div>
              ) : errorMsg ? (
                <p className="error-msg">{errorMsg}</p>
              ) : (
                ""
              )}
            </div>
          </>
        )
      ) : (
        <div className={styles.spinner}>
          <Spinner />
        </div>
      )}
    </div>
  );
}

export default EcomercePage;
