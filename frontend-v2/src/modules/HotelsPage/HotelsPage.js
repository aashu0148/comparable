import React, { useEffect, useRef, useState } from "react";
import ReactDOM, { flushSync } from "react-dom";
import { useSelector } from "react-redux";
import {
  ArrowUpRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  Users,
  WifiOff,
  X,
} from "react-feather";
import { io } from "socket.io-client";

import { Button } from "components/Button";
import Dropdown from "components/Dropdown/Dropdown";
import Spinner from "components/Spinner/Spinner";
import ProgressBar from "components/ProgressBar/ProgressBar";
import CheckinCheckoutDropdown from "./CheckinCheckoutDropdown/CheckinCheckoutDropdown";
import RoomsDropdown from "./RoomsDropdown/RoomsDropdown";
import BubbleParallax from "components/BubbleParallax/BubbleParallax";
import HotelResultCard from "components/HotelResultCard/HotelResultCard";

import {
  allScrappersList,
  platformNames,
  suggestionToScrapperMapping,
} from "utils/constants";
import {
  compareStrWithArrWrtShorter,
  findRelevancyScore,
  getFormattedDate,
} from "utils/util";
import { getConnection } from "api/connection";
import { getHotels, getHotelSuggestions } from "api/hotel";

import styles from "./HotelsPage.module.scss";

let socket;
let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
let timeout;
function HotelsPage() {
  const availableSortOptions = {
    relevant: "Relevant",
    priceLowToHigh: "Price Low to High",
    priceHighToLow: "Price High to Low",
  };
  const searchBoxRef = useRef();
  const searchInputRef = useRef();
  const isMobileView = useSelector((state) => state.root.mobileView);

  const [pageLoaded, setPageLoaded] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [currentSort, setCurrentSort] = useState(availableSortOptions.relevant);
  const [globalError, setGlobalError] = useState("");
  const [errorMsg, setErrorMsg] = useState({
    hotel: "",
    search: "",
  });
  const [connectionId, setConnectionId] = useState("");
  const [isConnectedToSocket, setIsConnectedToSocket] = useState("");
  const [currentSuggestionRequestData, setCurrentSuggestionRequestData] =
    useState({});
  const [suggestionResults, setSuggestionsResults] = useState({});
  const [currentRequestData, setCurrentRequestData] = useState({});
  const [fetchingHotels, setFetchingHotels] = useState(false);
  const [hotels, setHotels] = useState({});
  const [groupedHotels, setGroupedHotels] = useState([]);
  const [hotelsAccToSection, setHotelsAccToSection] = useState([]);
  const [selectedSection, setSelectedSection] = useState("all");
  const [sections, setSections] = useState([]);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showCheckinCheckoutDropdown, setShowCheckinCheckoutDropdown] =
    useState(false);
  const [showRoomsDropdown, setShowRoomsDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState({});
  const [dates, setDates] = useState([]);
  const [roomsData, setRoomsData] = useState({
    rooms: 1,
    adults: 1,
    children: [],
  });
  const [lastSearchValue, setLastSearchValue] = useState("");

  const remainingFrom =
    currentRequestData.expectedFrom?.length > 0
      ? currentRequestData.expectedFrom?.filter((item) =>
          hotels[item] ? false : true
        )
      : [];
  const remainingSuggestionsFrom =
    currentSuggestionRequestData.expectedFrom?.length > 0
      ? currentSuggestionRequestData.expectedFrom?.filter((item) =>
          suggestionResults[item] ? false : true
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
    setFetchingHotels(false);

    const from = data.from || "";
    const resultedArr = Array.isArray(data.result)
      ? data.result.map((item) => {
          let price = parseInt(item.price) || 0;
          const ratingArr = item.rating ? item.rating.split("/") : [];

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
            ratings: {
              obtained: ratingArr.length > 1 ? parseFloat(ratingArr[0]) : 0,
              max: ratingArr.length > 1 ? parseFloat(ratingArr[1]) : 0,
            },
            from,
          };
        })
      : [];

    const tempHotel = {
      [allScrappersList[from]]: resultedArr,
    };
    setHotels((prev) => ({ ...prev, ...tempHotel }));
  };

  const combineSuggestionResults = (presentResults) => {
    const result = [];
    const objArr = Object.values(presentResults);

    // the logic is to simply pick 1st suggestion from every platform and find best match for that among other platforms and in the end combine all the best matched under one variable
    objArr.forEach((mainItem) => {
      const main = mainItem[0];
      if (!mainItem) return;
      const resItem = {
        ...main,
        grouped: [],
      };

      objArr.forEach((arr) => {
        if (!arr.length || arr[0].from == main?.from) return;

        const mainLabel = main?.label;
        const labelsArr = arr.map((item) => item.label);
        const scores = compareStrWithArrWrtShorter(mainLabel, labelsArr);
        let maxScore = 0,
          maxScoreIndex = -1;
        scores.forEach((s, index) => {
          if (s > maxScore) {
            maxScore = s;
            maxScoreIndex = index;
          }
        });

        const goodMatch = arr[maxScoreIndex];
        resItem.grouped.push(goodMatch);
      });
      if (resItem.grouped?.length) result.push(resItem);
    });

    return result;
  };

  const handleSuggestionFromSocket = async (data) => {
    const resKey = data?.responseKey;
    let currReqData, suggestionResults;
    flushSync(() => {
      setCurrentSuggestionRequestData((prev) => {
        currReqData = prev;
        return prev;
      });

      setSuggestionsResults((prev) => {
        const newResults = { ...prev, [data.from]: data.result };
        suggestionResults = newResults;
        return newResults;
      });
    });

    if (!currReqData.responseKey || currReqData.responseKey !== resKey) return;
    setSuggestionsLoading(false);

    if (Object.keys(suggestionResults).length < 3) return;
    const suggestions = combineSuggestionResults(suggestionResults);
    setSuggestions(suggestions.filter((item) => item?.label));
  };

  const fetchHotels = async (query, data) => {
    setErrorMsg((prev) => ({ ...prev, hotel: "" }));
    const res = await getHotels(
      `${query}-${data.options?.rooms}-${data.options?.adults}-${
        data.options?.children?.length
      }-${getFormattedDate(data.options?.checkInDate)}-${getFormattedDate(
        data.options?.checkOutDate
      )}`,
      data,
      connectionId
    );
    if (!res?.data) {
      setErrorMsg((prev) => ({
        ...prev,
        hotel: res.message || "Error getting hotels",
      }));
      return;
    }

    return res.data;
  };

  const handleFetchAgain = async (from) => {
    if (from == "all") {
      handleSearchButtonClick();
      return;
    }
    if (
      !from ||
      !dates.length ||
      !roomsData.adults ||
      !roomsData.rooms ||
      !selectedSuggestion?.label ||
      !selectedSuggestion?.grouped
    )
      return;

    const tempHotels = { ...hotels };
    delete tempHotels[from];
    setHotels(tempHotels);

    const wholeData = {
      adults: roomsData.adults,
      children: roomsData.children,
      rooms: roomsData.rooms,
      checkInDate: new Date(dates[0]).toDateString(),
      checkOutDate: new Date(dates[1]).toDateString(),
    };

    let detailedData = {};

    if (suggestionToScrapperMapping[selectedSuggestion.from] == from)
      detailedData = {
        [selectedSuggestion.from]: {
          ...selectedSuggestion,
          grouped: undefined,
        },
      };
    selectedSuggestion.grouped.forEach((item) => {
      if (suggestionToScrapperMapping[item.from] == from)
        detailedData[item.from] = { ...item };
    });
    wholeData.details = detailedData;

    const data = await fetchHotels(selectedSuggestion.label, {
      options: wholeData,
      requestedFrom: [from],
    });

    if (!data) return;
    const resKey = data.responseKey;

    setTimeout(() => {
      let currReqData, hotels;
      flushSync(() => {
        setCurrentSuggestionRequestData((prev) => {
          currReqData = prev;
          return prev;
        });
        setHotels((prev) => {
          hotels = prev;
          return prev;
        });
      });

      if (resKey == currentRequestData?.responseKey) {
        console.log("force Stop req");
        currReqData.expectedFrom?.forEach((item) => {
          if (!hotels[item]) hotels[item] = [];
        });
      }
    }, 60 * 1000);

    setCurrentRequestData((prev) => ({
      ...prev,
      responseKey: data.responseKey,
    }));
  };

  const handleSearchButtonClick = async () => {
    if (!selectedSuggestion?.label || !selectedSuggestion?.grouped) {
      setErrorMsg((prev) => ({
        ...prev,
        search: "Please select the city from dropdown",
      }));
      return;
    } else if (!roomsData.adults || !roomsData.rooms) {
      setErrorMsg((prev) => ({
        ...prev,
        search: "Number of rooms and adults should be greater than 0",
      }));
      return;
    } else if (!dates.length) {
      setErrorMsg((prev) => ({
        ...prev,
        search: "Please select checkIn and checkOut date",
      }));
      return;
    }
    setErrorMsg((prev) => ({
      ...prev,
      search: "",
    }));

    const wholeData = {
      adults: roomsData.adults,
      children: roomsData.children,
      rooms: roomsData.rooms,
      checkInDate: new Date(dates[0]).toDateString(),
      checkOutDate: new Date(dates[1]).toDateString(),
    };

    const detailedData = {
      [selectedSuggestion.from]: {
        ...selectedSuggestion,
        grouped: undefined,
      },
    };
    selectedSuggestion.grouped.forEach((item) => {
      detailedData[item.from] = { ...item };
    });
    wholeData.details = detailedData;

    setCurrentRequestData({});
    setHotels({});
    setFetchingHotels(true);
    setSections([]);
    setSelectedSection("combined");
    setShowSuggestionModal(false);
    const data = await fetchHotels(selectedSuggestion.label, {
      options: wholeData,
    });
    if (!data) return;

    const resKey = data?.responseKey;

    setTimeout(() => {
      let currReqData, hotels;
      flushSync(() => {
        setCurrentSuggestionRequestData((prev) => {
          currReqData = prev;
          return prev;
        });
        setHotels((prev) => {
          hotels = prev;
          return prev;
        });
      });

      if (resKey == currentRequestData?.responseKey) {
        console.log("force Stop req");
        currReqData.expectedFrom?.forEach((item) => {
          if (!hotels[item]) hotels[item] = [];
        });
      }
    }, 40 * 1000);
    setSections(["all", "combined", ...data.expectedFrom]);
    setCurrentRequestData(data);
  };

  const handleSectionChange = (section, sort = currentSort) => {
    let data = [];
    switch (section) {
      case "all": {
        Object.values(hotels).forEach((item) => {
          data.push(...item);
        });
        break;
      }
      default:
        data = hotels[section] ? hotels[section] : [];
    }

    const sortedHotels = sortHotels(sort, data);
    setSelectedSection(section);
    setHotelsAccToSection(sortedHotels);
  };

  const handleSearchInputChange = (val) => {
    setSearchInputValue(val);

    if (!val.trim()) {
      setShowSuggestionModal(false);
      return;
    }

    setShowSuggestionModal(true);
    debounce(() => fetchSuggestions(val.trim()), 500);
  };

  const fetchSuggestions = async (input) => {
    setSuggestionsLoading(true);
    setSuggestions([]);
    setCurrentSuggestionRequestData({});
    setSuggestionsResults({});
    setSelectedSuggestion("");
    const res = await getHotelSuggestions(input, connectionId);
    if (!res?.data) return;
    setCurrentSuggestionRequestData(res.data);
  };

  const sortHotels = (sort, data = []) => {
    if (!sort || !data.length) return [];
    if (typeof hotels !== "object") return [];

    const tempHotels = { ...hotels };
    if (Object.keys(tempHotels).length === 0) return [];

    if (sort === `${availableSortOptions.priceLowToHigh}`) {
      data.sort((a, b) =>
        a.price < b.price ? -1 : a.price == b.price ? 0 : 1
      );
    } else if (sort === `${availableSortOptions.priceHighToLow}`) {
      data.sort((a, b) =>
        a.price > b.price ? -1 : a.price == b.price ? 0 : 1
      );
    } else if (sort === `${availableSortOptions.relevant}`) {
      const names = data.map((item) => item.name);
      const scores = findRelevancyScore(lastSearchValue, names);
      let sumPrice = 0;
      data.forEach((item, index) => {
        sumPrice = item.price + sumPrice;
        item.score = parseFloat(scores[index]);
      });
      const halfOfAveragePrice = sumPrice / (data.length * 2);

      data.sort((a, b) => {
        if (
          a.name.toLowerCase().includes("renewed") ||
          a.name.toLowerCase().includes("refurbish")
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

  const handleCheckinCheckoutDateChange = (dateArr) => {
    const d1 = dateArr[0];
    const d2 = dateArr[1];
    if (!d1 || new Date(d1) >= new Date(d2)) return;

    const d1WithoutTime = d1.toLocaleDateString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const currentStartDateWithoutTime = dates[0]
      ? dates[0].toLocaleDateString(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      : "";

    setDates(dateArr);
    if (
      dateArr[0] &&
      dateArr[1] &&
      d1WithoutTime == currentStartDateWithoutTime
    )
      setShowCheckinCheckoutDropdown(false);
  };

  const groupHotels = (hotelObj) => {
    if (!Object.keys(hotelObj).length) return [];

    const hotels = [
      ...Object.values(hotelObj).reduce((acc, curr) => [...acc, ...curr], []),
    ];

    if (!Array.isArray(hotels) || !hotels.length) return [];
    hotels.forEach((item) => (item.occupied = false));

    let result = [];
    hotels.forEach((item) => {
      if (item.occupied) return;

      const bestScores = compareStrWithArrWrtShorter(
        item.name,
        hotels.map((item) => item.name)
      )
        .map((item, index) => ({ score: item, index }))
        .filter((item) => item.score > 0.88);
      if (bestScores.length < 2) return;

      item.occupied = true;
      const newRes = [item];
      bestScores.forEach((s) => {
        const item = hotels[s.index];
        if (item.occupied) return;
        item.occupied = true;
        newRes.push(item);
      });

      result.push(
        newRes.filter(
          (item, index, self) =>
            self.findIndex((e) => e.from == item.from) == index
        )
      );
    });

    result.sort((a, b) => (a.length < b.length ? 1 : -1));

    return [
      ...result,
      ...hotels.filter((item) => !item.occupied).map((item) => [item]),
    ];
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("data", handleDataFromSocket);
    socket.on("suggestion", handleSuggestionFromSocket);

    return () => {
      if (socket) socket.off("data", handleDataFromSocket);
      if (socket) socket.off("suggestion", handleSuggestionFromSocket);
    };
  }, [socket]);

  useEffect(() => {
    setGroupedHotels(groupHotels(hotels));
    if (Object.keys(hotels).length > 0) handleSectionChange(selectedSection);
  }, [hotels]);

  useEffect(() => {
    fetchConnection();

    return () => {
      if (socket?.connected) {
        socket.disconnect();
        socket.close();
      }
    };
  }, []);

  const searchSectionDiv = (
    <div className={styles.searchSection}>
      <div className={styles.searchIcon}>
        <Search />
      </div>
      <input
        ref={searchInputRef}
        className="basic-input"
        placeholder="Enter city name"
        onChange={(event) => handleSearchInputChange(event.target.value)}
        value={searchInputValue || selectedSuggestion?.label || ""}
        onFocus={() =>
          suggestions.length > 0 ? setShowSuggestionModal(true) : ""
        }
        disabled={!isConnectedToSocket}
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

      {showSuggestionModal && (
        <Dropdown
          className={styles.suggestions}
          onClose={() => {
            setSearchInputValue("");
            setShowSuggestionModal(false);
          }}
        >
          <p className={styles.info}>Please select city from the list</p>
          {suggestionsLoading || remainingSuggestionsFrom.length > 0 ? (
            <div className={styles.suggestionsLoading}>
              <p>
                <b>Loading...</b>
              </p>
              {currentSuggestionRequestData?.expectedFrom?.length > 0 && (
                <div className={styles.progressContainer}>
                  <ProgressBar
                    progress={
                      100 -
                      (remainingSuggestionsFrom.length /
                        currentSuggestionRequestData.expectedFrom?.length) *
                        100
                    }
                  />
                </div>
              )}
            </div>
          ) : (
            suggestions.map((item) => (
              <div
                className={styles.suggestion}
                key={item._id}
                onClick={() => {
                  setShowSuggestionModal(false);
                  setSearchInputValue("");
                  setSelectedSuggestion(item);
                }}
              >
                <p>{item.label}</p>
                <div
                  className="icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSearchInputValue(item.label);
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
  );

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

      {/* <div className={styles.parallax}>
        <BubbleParallax />
      </div> */}

      <div className={styles.header}>
        <div className={styles.left}>
          <p className={styles.title}>
            Book{" "}
            <span>
              Hotels
              <img src="/images/headerSmileVector.svg" alt=":)" />
            </span>{" "}
            at best price
          </p>
          <p className={styles.desc}>
            Compare prices of same Hotel on different platforms all at once and
            book with the best price available. Search hotels from 5 different
            platforms.
          </p>
          <Button
            onClick={() =>
              searchBoxRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Book now
          </Button>
        </div>
        <div className={styles.right}>
          <img src="/images/hotelBookingImage.png" alt="Hotel Image" />
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
              <p className={styles.heading}>Search hotels</p>

              <div className={styles.inner}>
                {!isMobileView && searchSectionDiv}

                <div className={styles.bar} />

                <div className={styles.dateSection}>
                  {showCheckinCheckoutDropdown && (
                    <CheckinCheckoutDropdown
                      checkinDate={dates[0]}
                      checkoutDate={dates[1]}
                      forCheckIn={showCheckinCheckoutDropdown == "in"}
                      onClose={() => setShowCheckinCheckoutDropdown(false)}
                      onDateChange={handleCheckinCheckoutDateChange}
                    />
                  )}

                  <div
                    className={styles.innerBox}
                    onClick={() => setShowCheckinCheckoutDropdown("in")}
                  >
                    <p className={styles.info}>Checkin</p>
                    <div className={styles.date}>
                      <Calendar />{" "}
                      <p className={styles.title}>
                        {getFormattedDate(dates[0], true) || "___ ,__-__-__"}
                      </p>
                    </div>
                  </div>

                  <p className={styles.separator}>-</p>

                  <div
                    className={styles.innerBox}
                    onClick={() => setShowCheckinCheckoutDropdown("out")}
                  >
                    <p className={styles.info}>Checkout</p>
                    <div className={styles.date}>
                      <Calendar />{" "}
                      <p className={styles.title}>
                        {getFormattedDate(dates[1], true) || "___ ,__-__-__"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.bar} />

                <div
                  className={styles.guestSection}
                  onClick={() => setShowRoomsDropdown(true)}
                >
                  {showRoomsDropdown && (
                    <RoomsDropdown
                      data={roomsData}
                      onClose={(data) => {
                        setRoomsData(data);
                        setShowRoomsDropdown(false);
                      }}
                    />
                  )}

                  <p className={styles.info}>Rooms</p>
                  <div className={styles.bottom}>
                    <Users />{" "}
                    <p className={styles.title}>
                      {roomsData.adults + roomsData.children?.length} guests
                    </p>
                  </div>
                </div>

                <div className={styles.bar} />

                {isMobileView && searchSectionDiv}
                <Button
                  className={`${styles.button} ${
                    isConnectedToSocket ? "" : styles.connecting
                  }`}
                  onClick={() => handleSearchButtonClick()}
                  disabled={!isConnectedToSocket || fetchingHotels}
                >
                  {isConnectedToSocket ? "Search" : "Connecting..."}
                </Button>
              </div>

              {errorMsg.search && (
                <p className={styles.error}>{errorMsg.search}</p>
              )}
            </div>

            <div className={styles.searchResults}>
              {currentRequestData?.expectedFrom ? (
                <div className={styles.head}>
                  <p className={styles.title}>
                    {currentRequestData.search.split("-")[0]}
                  </p>

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

              {Object.keys(hotels).length > 0 ? (
                <div
                  className={styles.cards}
                  onClick={(event) => event.stopPropagation()}
                >
                  {hotelsAccToSection.length == 0 ? (
                    remainingFrom.includes(selectedSection) ? (
                      <div className={styles.spinner}>
                        <Spinner />
                      </div>
                    ) : selectedSection == "combined" ? (
                      groupedHotels?.length > 0 ? (
                        groupedHotels.map((item) => (
                          <HotelResultCard
                            key={item[0].id}
                            details={item[0]}
                            grouped={item}
                          />
                        ))
                      ) : (
                        <div className={styles.empty}>
                          <p className={styles.title}>
                            Not able to combine results 😥
                          </p>
                        </div>
                      )
                    ) : (
                      <div className={styles.empty}>
                        {/* <img src="/images/sadSearchIcon.png" alt="_" /> */}
                        <img src="/images/emptyBoxIcon.png" alt="_" />
                        <p className={styles.title}>No Hotels found</p>
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
                    hotelsAccToSection.map((item) => (
                      <HotelResultCard key={item.id} details={item} />
                    ))
                  )}
                </div>
              ) : fetchingHotels ? (
                <div className={styles.spinner}>
                  <Spinner />
                </div>
              ) : errorMsg.hotel ? (
                <p className="error-msg">{errorMsg.hotel}</p>
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

export default HotelsPage;
