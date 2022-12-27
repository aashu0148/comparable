import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";

import Fashion from "../Fashion/Fashion.js";
import GeneralCard from "../General/GeneralCard.js";

import {
  allScrappersList,
  availableCategories,
  logoMappingWithScrapper,
} from "constants.js";

import styles from "./DeckCard.module.scss";

function DeckCard(props) {
  const connectionId = props?.connectionId;
  const isDeckView = props.isDeck ? true : false;
  const from = props.from || allScrappersList.amazon;
  const { category } = useParams();
  const isFashionCategory =
    category == availableCategories.fashion ? true : false;

  const [currentCardDetails, setCurrentCardDetails] = useState({
    class: "",
    logo: "",
    name: "",
  });
  const [results, setResults] = useState(props.results);

  const isLoading = !results ? true : false;

  const setCardDetails = () => {
    let className = "",
      logo;

    switch (from) {
      case allScrappersList.amazon: {
        className = styles.amazonContainer;
        logo = logoMappingWithScrapper[allScrappersList.amazon].square;
        break;
      }
      case allScrappersList.flipkart: {
        className = styles.flipkartContainer;
        logo = logoMappingWithScrapper[allScrappersList.flipkart].square;
        break;
      }
      case allScrappersList.ajio: {
        className = styles.ajioContainer;
        logo = logoMappingWithScrapper[allScrappersList.ajio].square;
        break;
      }
      case allScrappersList.nykaa: {
        className = styles.nykaaContainer;
        logo = logoMappingWithScrapper[allScrappersList.nykaa].square;
        break;
      }
      case allScrappersList.tatacliq: {
        className = styles.tatacliqContainer;
        logo = logoMappingWithScrapper[allScrappersList.tatacliq].square;
        break;
      }
      case allScrappersList.reliance: {
        className = styles.relianceContainer;
        logo = logoMappingWithScrapper[allScrappersList.reliance].square;
        break;
      }
      case allScrappersList.croma: {
        className = styles.cromaContainer;
        logo = logoMappingWithScrapper[allScrappersList.croma].square;
        break;
      }
      case allScrappersList.meesho: {
        className = styles.meeshoContainer;
        logo = logoMappingWithScrapper[allScrappersList.meesho].square;
        break;
      }
      case allScrappersList.snapdeal: {
        className = styles.snapdealContainer;
        logo = logoMappingWithScrapper[allScrappersList.snapdeal].square;
        break;
      }
      case allScrappersList.shopclues: {
        className = styles.shopcluesContainer;
        logo = logoMappingWithScrapper[allScrappersList.shopclues].square;
        break;
      }
    }

    setCurrentCardDetails({
      class: className,
      logo,
      name: from,
    });
  };

  useEffect(() => {
    if (props.results && Array.isArray(props.results))
      setResults(props.results);
  }, [props.results]);

  useEffect(() => {
    setCardDetails();
  }, []);

  const generateDeckCardDiv = (expanded = false) => (
    <div
      className={`${styles.container} ${currentCardDetails.class} ${
        isLoading ? `loading ${styles.loading}` : ""
      } ${props.fullWidth ? styles.fullWidth : ""}`}
      aria-label={from}
      onClick={() => (props.onClick && !isLoading ? props.onClick() : "")}
    >
      <div
        className={`image-circle ${styles.image} ${
          expanded ? styles.expanded : ""
        }`}
      >
        <img src={currentCardDetails.logo} alt="Amazon" />
      </div>
      {isLoading ? (
        ""
      ) : (
        <>
          <p className={styles.title}>
            {currentCardDetails.name} <span>({results.length})</span>
          </p>
          <p className={styles.desc}>
            Click to {expanded ? "collapse" : "expand"}
          </p>
        </>
      )}
    </div>
  );

  return isDeckView ? (
    generateDeckCardDiv()
  ) : isLoading ? (
    ""
  ) : (
    <>
      {generateDeckCardDiv(true)}
      {results.length == 0 ? (
        <div
          className={`${styles.empty} ${
            props.fullWidth ? styles.emptyFullWidth : ""
          }`}
        >
          <p className={styles.emoji}>😥</p>
          <p className={styles.title}>Can't find on {from}.</p>
          <p className={styles.desc}>
            If you think that the platform must have results for what you
            searched then try searching the same{" "}
            <span onClick={() => (props.refresh ? props.refresh() : "")}>
              again
            </span>
          </p>
        </div>
      ) : (
        results.map((item) =>
          isFashionCategory ? (
            <Fashion
              connectionId={connectionId}
              key={from + item.id}
              details={item}
              from={from}
            />
          ) : (
            <GeneralCard
              connectionId={connectionId}
              key={from + item.id}
              details={item}
              from={from}
            />
          )
        )
      )}
    </>
  );
}

DeckCard.propTypes = {
  connectionId: PropTypes.string,
  isDeck: PropTypes.bool,
  from: PropTypes.string,
  results: PropTypes.array,
  onClick: PropTypes.func,
  refresh: PropTypes.func,
  fullWidth: PropTypes.bool,
};

export default DeckCard;
