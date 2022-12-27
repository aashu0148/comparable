import React from "react";
import PropTypes from "prop-types";

import {
  fashionSelectionMapping,
  electronicsSelectionMapping,
  availableCategories,
} from "constants.js";

import styles from "./HorizontalProductSection.module.scss";

function HorizontalProductSection(props) {
  const category = props.category || "";

  const categorySpecificSelection = {
    fashion: fashionSelectionMapping,
    electronics: electronicsSelectionMapping,
  };

  const categoryMapping = categorySpecificSelection[category];

  return (
    <div className={styles.HorizontalProductSection}>
      {category === availableCategories.fashion ? (
        <>
          {props?.gender === "men" ? (
            <div className={styles.genderSpecificFashion}>
              {categoryMapping?.men?.map((item, index) => (
                <div
                  className={styles.searchSelectionCard}
                  onClick={() => {
                    props.clicked(`${Object.keys(item)[0]}`);
                  }}
                  key={index}
                >
                  <div className={styles.imageBox}>
                    <img
                      src={item[Object.keys(item)[0]]}
                      alt={Object.keys(item)[0]}
                    />
                  </div>
                  <p>{Object.keys(item)[0]}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.genderSpecificFashion}>
              {categoryMapping?.women?.map((item, index) => (
                <div
                  className={styles.searchSelectionCard}
                  onClick={() => {
                    props.clicked(`${Object.keys(item)[0]}`);
                  }}
                  key={index + styles.searchSelectionCard}
                >
                  <div className={styles.imageBox}>
                    <img
                      src={item[Object.keys(item)[0]]}
                      alt={Object.keys(item)[0]}
                    />
                  </div>
                  <p>{Object.keys(item)[0]}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : category === availableCategories.electronics ? (
        <div className={styles.scrollableChild}>
          {categoryMapping?.map((item, index) => (
            <div
              className={styles.searchSelectionCard}
              onClick={() => {
                props.clicked(`${Object.keys(item)[0]}`);
              }}
              key={index + styles.searchSelectionCard}
            >
              <div className={styles.imageBox}>
                <img
                  src={item[Object.keys(item)[0]]}
                  alt={Object.keys(item)[0]}
                />
              </div>
              <p>{Object.keys(item)[0]}</p>
            </div>
          ))}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

HorizontalProductSection.propTypes = {
  category: PropTypes.string,
  gender: PropTypes.string,
  clicked: PropTypes.func,
};

export default HorizontalProductSection;
