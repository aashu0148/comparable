import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";

import DeckCard from "components/Cards/DeckCard/DeckCard";

import {
  allScrappersList,
  availableCategories,
  logoMappingWithScrapper,
} from "constants.js";

import styles from "./DeckView.module.scss";

function DeckView(props) {
  const connectionId = props?.connectionId;
  const { data, expectedFrom } = props;
  const { category } = useParams();
  const isFashionCategory =
    category == availableCategories.fashion ? true : false;
  const tempExpectedFrom =
    expectedFrom && Array.isArray(expectedFrom)
      ? expectedFrom.length % 2 == 0
        ? [...expectedFrom]
        : [...expectedFrom, ""]
      : "";

  const [activeDecks, setActiveDecks] = useState([]);
  const parentRef = useRef();

  const toggleActiveIndex = (deckName) => {
    if (!deckName) return;
    const tempActiveDecks = [...activeDecks];
    const index = tempActiveDecks.findIndex((item) => item == deckName);
    if (index < 0) {
      tempActiveDecks.push(deckName);
    } else {
      tempActiveDecks.splice(index, 1);
    }

    setActiveDecks(tempActiveDecks);
  };

  const handleDeckIconClick = (item) => {
    if (!item) return;
    if (data[item]) {
      toggleActiveIndex(item);
    }
    const nodeList = parentRef.current.childNodes;
    for (let i = 0; i < nodeList.length; ++i) {
      if (nodeList[i].ariaLabel === item) {
        const elem = nodeList[i];
        if (activeDecks.some((item) => item === elem.ariaLabel)) break;
        elem.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        break;
      }
    }
  };

  return Array.isArray(tempExpectedFrom) && typeof data == "object" ? (
    <div className={styles.container} ref={parentRef}>
      <div className={styles.deckPanel}>
        {expectedFrom.map((item, index) => (
          <div
            key={item + index}
            className={`${styles.image} ${
              activeDecks.some((deckName) => deckName == item)
                ? styles.active
                : ""
            }`}
            onClick={() => {
              handleDeckIconClick(item);
            }}
          >
            {!data[item] && <span className={`loading ${styles.loading}`} />}
            <img
              src={
                logoMappingWithScrapper[allScrappersList[item]]?.square || ""
              }
              alt={item}
            />
          </div>
        ))}
      </div>

      {tempExpectedFrom.map((item) => {
        if (!item)
          return <div style={{ minWidth: "47%" }} key={"emptyDivDeck"} />;

        const result = data[item] || "";
        return (
          <DeckCard
            connectionId={connectionId}
            key={item}
            onClick={() => toggleActiveIndex(item)}
            isDeck={!activeDecks.some((deckName) => deckName == item)}
            from={item}
            results={result}
            refresh={props.refresh}
            fullWidth={!isFashionCategory}
          />
        );
      })}
    </div>
  ) : (
    ""
  );
}

DeckView.propTypes = {
  connectionId: PropTypes.string,
  data: PropTypes.object,
  expectedFrom: PropTypes.array,
  refresh: PropTypes.func,
};

export default DeckView;
