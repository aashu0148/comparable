import React,{useState,useEffect} from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";

import GeneralCard from "components/Cards/General/GeneralCard";
import Fashion from "components/Cards/Fashion/Fashion";


import { extractIntegerFromString ,extractNumberFromStringWithLimit} from "util";
import { allScrappersList, availableCategories,availableSortOptions } from "constants.js";

import styles from "./ClubbedView.module.scss";
import { findRelevancyScore } from "util";

function ClubbedView(props) {
  const connectionId = props?.connectionId;
  const { data, expectedFrom } = props;
  const sortBy = props?.sortBy;
  const { category } = useParams();
  const isFashionCategory =
    category == availableCategories.fashion ? true : false;

  const [mixedResult,setMixedResult] = useState([]);


  const calculateAllResults = (results = data) => {
    if (
      !results ||
      typeof results != "object" ||
      Object.keys(results).length == 0
    )
      return;
    const allResults = [];

    for( let key in results){
      const items = results[key];
      items.forEach((item) => item.from = key);
      allResults.push(...items);
    }

    const titles = allResults.map((item) =>
      item.from == allScrappersList.flipkart
        ? item.title +
          (Array.isArray(item?.keySpecs) ? item.keySpecs[0] || "" : "")
        : item.title
    );
    const scores = findRelevancyScore(props.inputValue, titles);

    let sumPrice = 0;
    allResults.forEach((item, index) => {
      sumPrice = item.price + sumPrice;
      item.score = parseFloat(scores[index]);
    });
    const halfOfAveragePrice = sumPrice / (allResults.length * 2);

    allResults.sort((a, b) => {
      if (a.price < halfOfAveragePrice && b.price > halfOfAveragePrice)
        return 1;
      if (b.price < halfOfAveragePrice && a.price > halfOfAveragePrice)
        return -1;
      if (a.score == b.score)
        return a.price < b.price ? -1 : a.price == b.price ? 0 : 1;

      return a.score > b.score ? -1 : 1;
    });

    setMixedResult(allResults);
  };

  const sortByPriceLowToHigh = (results = data) => {
    if (
      !results ||
      typeof results != "object" ||
      Object.keys(results).length == 0
    )
      return;
    const allResults = [];

    for( let key in results){
      const items = results[key];
      items.forEach((item) => item.from = key);
      allResults.push(...items);
    }


    allResults.sort((a, b) => a.price < b.price ? -1 : a.price == b.price ? 0 : 1);
    setMixedResult(allResults);
  }

  const sortByPriceHighToLow = (results = data) => {
    if (
      !results ||
      typeof results != "object" ||
      Object.keys(results).length == 0
    )
      return;
    const allResults = [];

    for( let key in results){
      const items = results[key];
      items.forEach((item) => item.from = key);
      allResults.push(...items);
    }

    allResults.sort((a,b) => a.price > b.price ? -1 : a.price == b.price ? 0 : 1);
    setMixedResult(allResults);
  }

  const sortByRatings = (results = data) => {
    if (
      !results ||
      typeof results != "object" ||
      Object.keys(results).length == 0
    )
      return;
    const allResults = [];

    for( let key in results){
      const items = results[key];
      items.forEach((item) => {
        const reviews = item?.ratings?.totalReviews
    ? extractNumberFromStringWithLimit(item?.ratings?.totalReviews)
    : "";
        const ratings = {
          totalReviews : reviews,
          rating : item?.ratings?.rating,
        }
        item.from = key;
        item.ratings = ratings;
      })
      allResults.push(...items);
    }

    allResults.sort((a, b) =>
    extractIntegerFromString(a?.ratings?.totalReviews) >
    extractIntegerFromString(b?.ratings?.totalReviews)
            ? -1
            : extractIntegerFromString(a?.ratings?.totalReviews) == extractIntegerFromString(b?.ratings?.totalReviews)
            ? 0
            : 1
        );
    setMixedResult(allResults);
  }

  useEffect(() => {
    if(sortBy === availableSortOptions.relevance){
      calculateAllResults();
    }
    else if(sortBy === availableSortOptions.priceLowToHigh){
      sortByPriceLowToHigh();
    }
    else if(sortBy === availableSortOptions.priceHighToLow){
      sortByPriceHighToLow();
    }
    else if(sortBy === availableSortOptions.ratings){
      sortByRatings();
    }
    else{
      calculateAllResults();
    }
  },[sortBy,data]);

  return (
    <div className={styles.container}>
      {mixedResult && mixedResult?.map((item, index) =>
        isFashionCategory ? (
          <Fashion connectionId={connectionId} from={item.from} key={item.id + index} details={item} />
        ) : (
          <GeneralCard connectionId={connectionId} from={item.from} key={item.id + index} details={item} />
        )
      )}
    </div>
  );
}

ClubbedView.propTypes = {
  connectionId: PropTypes.string,
  data: PropTypes.object,
  expectedFrom: PropTypes.array,
  refresh: PropTypes.func,
  inputValue: PropTypes.string,
  sortBy: PropTypes.string,
};

export default ClubbedView;
