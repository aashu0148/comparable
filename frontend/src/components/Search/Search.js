import React, { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { ArrowUpRight, Search as SearchIcon } from "react-feather";
import { Filter } from "react-feather";

import sortIcon from "assets/icons/sortIcon.svg";
import scrollingIcon from "assets/icons/scrollingViewIcon.png";
import deckIcon from "assets/icons/deckViewIcon.png";
import clubbedIcon from "assets/icons/clubbedViewIcon.png";

import Spinner from "components/Spinner/Spinner";
import InputControl from "components/InputControl/InputControl";
import Dropdown from "components/Dropdown/Dropdown";
import Modal from "components/Modal/Modal";
import Filters from "components/Filters/Filters";
import DeckView from "components/DeckView/DeckView";
import ScrollingView from "components/ScrollingView/ScrollingView";
import ClubbedView from "components/ClubbedView/ClubbedView";
import HorizontalProductSection from "components/HorizontalProductSection/HorizontalProductSection";
import CategorySearchOptions from "components/CategorySearchOptions/CategorySearchOptions";

import {
  allScrappersList,
  availableCategories,
  availableSortOptions,
  categoryWiseFilters,
  logoMappingWithScrapper,
  searchPageViewTypes,
} from "constants.js";
import SearchHelper from "./SearchHelper";

import styles from "./Search.module.scss";

function Search(props) {
  const { socket, connectionId, isConnectedToSocket, isConnectingToSocket } =
    props;
  const inputRef = useRef();
  const blurInputBox = () => {
    inputRef.current?.blur();
  };
  const searchHelperUtil = SearchHelper({
    connectionId,
    blurInputBox,
  });

  const {
    sortBy,
    selectedSearchView,
    showSecondSpinner,
    inAppSortDropdown,
    infoSection,
    inputErrorMsg,
    inputValue,
    suggestions,
    isCustomCategory,
    isFetchingResults,
    isFilterModal,
    expectedResults,
    globalSortDropdown,
    result,
    category,
    cheapest,
    appliedFilters,
    customArray,
    showSuggestionDropdown,
    lastSearchValue,
    setShowSuggestionDropdown,
    setCheapest,
    setAppliedFilters,
    setInAppSortDropdown,
    setIsFilterModal,
    setSelectedSearchView,
    setInputValue,
    setGlobalSortDropdown,
  } = searchHelperUtil.state;
  const {
    handleInAppSort,
    handleSocketData,
    handleCustomSearch,
    handleGlobalSort,
    getCheapestProduct,
    handleProductSearch,
    handleCustomSearchChange,
    handleInputChange,
    handleSuggestionClick,
  } = searchHelperUtil.func;

  const availableSortOptionsMapping = {
    [availableSortOptions.relevance]: "Relevance",
    [availableSortOptions.featured]: "Featured",
    [availableSortOptions.newest]: "Newest",
    [availableSortOptions.priceHighToLow]: "Price ( High to Low )",
    [availableSortOptions.popularity]: "Popularity",
    [availableSortOptions.priceLowToHigh]: "Price ( low to High )",
    [availableSortOptions.ratings]: "Ratings",
  };
  const globalSorts = [
    availableSortOptions.popularity,
    availableSortOptions.priceLowToHigh,
    availableSortOptions.priceHighToLow,
    availableSortOptions.newest,
    availableSortOptions.featured,
  ];
  const inAppSorts = [
    availableSortOptions.relevance,
    availableSortOptions.priceLowToHigh,
    availableSortOptions.priceHighToLow,
    availableSortOptions.ratings,
  ];

  useEffect(() => {
    handleInAppSort(sortBy.inAppSort);
  }, [selectedSearchView]);

  useEffect(() => {
    if (!socket) return;

    socket.on("data", handleSocketData);

    return () => {
      if (!socket) return;
      socket.off("data", handleSocketData);
    };
  }, [socket]);

  useEffect(() => {
    setCheapest(getCheapestProduct(result));
    handleInAppSort(sortBy.inAppSort);
    if (typeof result !== "object") return;
    let cachedResults;
    try {
      cachedResults = JSON.parse(sessionStorage.getItem("results"));
    } catch (err) {
      cachedResults = "";
      console.error("Error in json parse ", err);
    }

    if (typeof cachedResults !== "object" || !cachedResults) {
      sessionStorage.setItem(
        "results",
        JSON.stringify({
          [lastSearchValue.toLowerCase()]: {
            data: { ...result },
            expectedFrom: expectedResults,
          },
        })
      );
      return;
    }
    cachedResults[lastSearchValue.toLowerCase()] = {
      data: { ...result },
      expectedFrom: expectedResults,
    };
    sessionStorage.setItem("results", JSON.stringify(cachedResults));
  }, [result]);

  const connectionStatusSection = (
    <div className={styles.messageSection}>
      {isConnectingToSocket ? (
        window.navigator.onLine ? (
          <p className={styles.connection}>
            Making connection, please hold on 🔵
          </p>
        ) : (
          <p className={`${styles.connection} ${styles.connectionRed}`}>
            You are offline. Please check Internet connection 😶‍🌫️
          </p>
        )
      ) : !isConnectedToSocket ? (
        window.navigator.onLine ? (
          <>
            <p className={`${styles.connection} ${styles.connectionRed}`}>
              Connection failed 😶‍🌫️
            </p>
            <p className={styles.connection}>Trying to reconnect 🔵</p>
          </>
        ) : (
          <p className={`${styles.connection} ${styles.connectionRed}`}>
            You are Offline. Please check Internet connection 😶‍🌫️
          </p>
        )
      ) : (
        <p className={`${styles.connection} ${styles.connectionGreen}`}>
          Connection established. Enjoy searching ✌️
        </p>
      )}
    </div>
  );

  return category ? (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.title}>
          Search your products in {category} category here
        </p>
      </div>
      {isCustomCategory && customArray.length < 2 ? (
        ""
      ) : (
        <div className={styles.formWrapper}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleProductSearch("", appliedFilters, [], inputValue);
            }}
            className={
              !isConnectingToSocket
                ? styles.activeSearch
                : styles.deactivateSearch
            }
          >
            <div className={styles.input}>
              <InputControl
                ref={inputRef}
                placeholder="Enter product here"
                onChange={(event) => handleInputChange(event.target.value)}
                value={inputValue}
                error={inputErrorMsg}
                disabled={!isConnectedToSocket || isFetchingResults}
              />
              {showSuggestionDropdown &&
              (suggestions.isLoading || suggestions.data.length > 0) ? (
                <Dropdown
                  onClose={() => setShowSuggestionDropdown(false)}
                  className={styles.selectContainer}
                >
                  {suggestions.isLoading ? (
                    <p className={styles.loading}>Loading...</p>
                  ) : suggestions.data.length > 0 ? (
                    suggestions.data.map((item, index) => (
                      <p
                        className={styles.item}
                        key={item + index}
                        onClick={() => handleSuggestionClick(item)}
                      >
                        {item}
                        <span
                          className={styles.copy}
                          onClick={(event) => {
                            event.stopPropagation();
                            setInputValue(item);
                          }}
                        >
                          <ArrowUpRight />
                        </span>
                      </p>
                    ))
                  ) : (
                    ""
                  )}
                </Dropdown>
              ) : (
                ""
              )}
            </div>
            <button
              onClick={() =>
                handleProductSearch("", appliedFilters, customArray, inputValue)
              }
              disabled={!isConnectedToSocket}
            >
              <SearchIcon />
            </button>
          </form>
        </div>
      )}

      {/* {errorMsg && <p className={styles.error}>{errorMsg}</p>} */}
      {connectionStatusSection}

      {Object.keys(result).length > 0 ? (
        <div className={styles.topSection}>
          <div className={styles.inAppSorting}>
            <button
              className={styles.sortbutton}
              onClick={() => setInAppSortDropdown(!inAppSortDropdown)}
            >
              In-app sort{" "}
              <div className={styles.iconImageContainer}>
                <img src={sortIcon} />
                {sortBy.inAppSort !== "" ? (
                  <span className={styles.activeSort}></span>
                ) : (
                  ""
                )}
              </div>
            </button>
            {inAppSortDropdown && (
              <Dropdown
                className={styles.sortDropdown}
                onClose={() => setInAppSortDropdown(!inAppSortDropdown)}
              >
                {inAppSorts.map((item) => (
                  <li onClick={() => handleInAppSort(item)}>
                    <input
                      type="radio"
                      readOnly
                      checked={sortBy.inAppSort === item}
                    />
                    {availableSortOptionsMapping[item]}
                  </li>
                ))}
              </Dropdown>
            )}
          </div>

          <div className={styles.views}>
            <p
              className={`${styles.icon} ${
                selectedSearchView == searchPageViewTypes.clubbed
                  ? styles.active
                  : ""
              }`}
              onClick={() => setSelectedSearchView(searchPageViewTypes.clubbed)}
            >
              <img src={clubbedIcon} alt="C" />
            </p>
            <p
              className={`${styles.icon} ${
                selectedSearchView == searchPageViewTypes.deckView
                  ? styles.active
                  : ""
              }`}
              onClick={() =>
                setSelectedSearchView(searchPageViewTypes.deckView)
              }
            >
              <img src={deckIcon} alt="D" />
            </p>
            <p
              className={`${styles.icon} ${
                selectedSearchView == searchPageViewTypes.scrolling
                  ? styles.active
                  : ""
              }`}
              onClick={() =>
                setSelectedSearchView(searchPageViewTypes.scrolling)
              }
            >
              <img src={scrollingIcon} alt="S" />
            </p>
          </div>
        </div>
      ) : (
        ""
      )}

      {Object.keys(result).length > 0 && customArray.length > 0 ? (
        <div className={styles.selectedStoresContainer}>
          <div className={styles.selectedCustomStores}>
            {customArray &&
              customArray?.map((store) => (
                <div className={styles.customStoreIcon}>
                  <img
                    src={
                      logoMappingWithScrapper[allScrappersList[store]]?.rect ||
                      ""
                    }
                    alt={store}
                  />
                </div>
              ))}
          </div>
          <div>
            <p className={styles.editIcon} onClick={handleCustomSearchChange}>
              Change
            </p>
          </div>
        </div>
      ) : (
        ""
      )}

      {category === availableCategories.fashion &&
        Object.keys(result).length > 0 && (
          <HorizontalProductSection
            category={category}
            gender={appliedFilters?.gender[0]}
            clicked={(queryString) => {
              setInputValue(queryString);
              handleProductSearch("", appliedFilters, [], queryString);
            }}
          ></HorizontalProductSection>
        )}

      {category === availableCategories.electronics &&
        Object.keys(result).length > 0 && (
          <HorizontalProductSection
            category={category}
            clicked={(queryString) => {
              setInputValue(queryString);
              handleProductSearch("", appliedFilters, [], queryString);
            }}
          ></HorizontalProductSection>
        )}

      {cheapest &&
      Object.keys(cheapest).length > 0 &&
      category !== availableCategories.fashion ? (
        <p className={`${styles.info} ${infoSection.class}`}>
          <span className={styles.from}>{cheapest.from}</span> is having best
          value for money at{" "}
          <span className={styles.price}>{cheapest.formattedPrice}</span>
          <br></br>
          <span className={styles.title}>{cheapest.title}</span>
        </p>
      ) : (
        ""
      )}
      <div className={styles.body}>
        {isFetchingResults && Object.keys(result).length === 0 ? (
          <div className={styles.spinner}>
            <Spinner second={showSecondSpinner} />
          </div>
        ) : Object.keys(result).length > 0 ? (
          selectedSearchView == searchPageViewTypes.scrolling ? (
            <ScrollingView
              connectionId={connectionId}
              expectedFrom={expectedResults}
              data={result}
              refresh={() =>
                handleProductSearch("", appliedFilters, customArray, inputValue)
              }
            />
          ) : selectedSearchView == searchPageViewTypes.clubbed ? (
            <ClubbedView
              connectionId={connectionId}
              expectedFrom={expectedResults}
              sortBy={sortBy?.inAppSort}
              data={result}
              refresh={() =>
                handleProductSearch("", appliedFilters, customArray, inputValue)
              }
              inputValue={inputValue}
            />
          ) : (
            <DeckView
              connectionId={connectionId}
              expectedFrom={expectedResults}
              data={result}
              refresh={() =>
                handleProductSearch("", appliedFilters, customArray, inputValue)
              }
            />
          )
        ) : category === availableCategories.fashion &&
          isConnectedToSocket &&
          Object.keys(result).length === 0 ? (
          <CategorySearchOptions
            category={category}
            gender={appliedFilters?.gender[0]}
            clicked={(queryString) => {
              setInputValue(queryString);
              handleProductSearch("", appliedFilters, [], queryString);
            }}
          ></CategorySearchOptions>
        ) : category === availableCategories.electronics &&
          isConnectedToSocket &&
          Object.keys(result).length === 0 ? (
          <CategorySearchOptions
            category={category}
            clicked={(queryString) => {
              setInputValue(queryString);
              handleProductSearch("", appliedFilters, [], queryString);
            }}
          ></CategorySearchOptions>
        ) : isCustomCategory ? (
          <div className={styles.customStoreContainer}>
            <div className={styles.customHeader}>
              {customArray.length < 2 ? (
                <p className={styles.blue}>
                  Select at least 2 platforms to begin
                </p>
              ) : (
                <p className={customArray.length == 5 ? styles.max : ""}>
                  Currently 5 maximum platforms are allowed
                </p>
              )}
            </div>

            {Object.keys(logoMappingWithScrapper).map((store) => (
              <div
                className={`${styles.customStoreCard} ${
                  customArray.some((item) => item === store)
                    ? styles.selectedStore
                    : ""
                }`}
                onClick={() => handleCustomSearch(store)}
              >
                <div className={styles.customImageWrapper}>
                  <img
                    src={
                      logoMappingWithScrapper[allScrappersList[store]]
                        ?.square || ""
                    }
                    alt={store}
                  />
                </div>
                <p className={styles.text}>{store}</p>
              </div>
            ))}
          </div>
        ) : (
          ""
        )}

        {Object.keys(result).length > 0 ? (
          <div className={styles.sortAndFilter}>
            <div
              className={styles.globalSortButton}
              onClick={() => setGlobalSortDropdown(!globalSortDropdown)}
            >
              <p>
                Sort
                <div className={styles.iconImageContainer}>
                  <img src={sortIcon} />
                  {sortBy.globalSort !== "" ? (
                    <span className={styles.activeSort}></span>
                  ) : (
                    ""
                  )}
                </div>
              </p>
              {globalSortDropdown && (
                <div className={styles.globalSortDropdownContainer}>
                  <Dropdown
                    className={styles.customStyles}
                    onClose={() => setGlobalSortDropdown(!globalSortDropdown)}
                  >
                    {globalSorts.map((item) => (
                      <li
                        key={item}
                        onClick={() => handleGlobalSort(item, customArray)}
                      >
                        <input
                          type="radio"
                          readOnly
                          checked={sortBy.globalSort === item}
                        />
                        {availableSortOptionsMapping[item]}
                      </li>
                    ))}
                  </Dropdown>
                </div>
              )}
            </div>
            <div
              className={styles.globalFilterButton}
              onClick={() => {
                setIsFilterModal(true);
              }}
            >
              <p>
                Filter{" "}
                <div>
                  <Filter className={styles.filterIcon} />
                  {Object.keys(appliedFilters).length > 0 ? (
                    <span className={styles.activeFilters}></span>
                  ) : (
                    ""
                  )}
                </div>
              </p>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
      {isFilterModal ? (
        <Modal
          className={styles.modalContainer}
          onClose={() => setIsFilterModal(false)}
          isMobileModal={true}
        >
          <div className={styles.filterContainer}>
            <Filters
              filterOption={categoryWiseFilters[category]}
              appliedFilters={appliedFilters}
              category={category}
              close={() => setIsFilterModal(false)}
              applyFilter={(filters) => {
                {
                  category === availableCategories.custom
                    ? handleProductSearch("", filters, customArray, inputValue)
                    : handleProductSearch("", filters, [], inputValue);
                }
                setIsFilterModal(false);
                sessionStorage.setItem(
                  `${category}filters`,
                  JSON.stringify(filters)
                );
                setAppliedFilters(filters);
              }}
            ></Filters>
          </div>
        </Modal>
      ) : (
        ""
      )}
    </div>
  ) : (
    <Navigate to="/" />
  );
}

Search.propTypes = {
  socket: PropTypes.any,
  isConnectedToSocket: PropTypes.bool,
  isConnectingToSocket: PropTypes.bool,
  connectionId: PropTypes.string,
};

export default Search;
