import React from "react";
import PropTypes from "prop-types";

import {
  fashionSelectionMapping,
  electronicsSelectionMapping,
  availableCategories,
} from "constants.js";

import styles from "./CategorySearchOptions.module.scss";

function CategorySearchOptions(props) {
  const category = props.category || "";

  const categorySpecificSelection = {
    fashion: fashionSelectionMapping,
    electronics: electronicsSelectionMapping,
  };

  const categoryMapping = categorySpecificSelection[category];

  return (
    <div className={styles.CategorySearchOptions}>
      {category === availableCategories.fashion ? (
        <>
          {props?.gender === "men" ? (
            <div className={styles.genderSpecificFashion}>
              {categoryMapping?.men?.map((item) => (
                <div
                  key={Object.keys(item)[0]}
                  className={styles.searchSelectionCard}
                  onClick={() => {
                    props.clicked(`${Object.keys(item)[0]}`);
                  }}
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
              {categoryMapping?.women?.map((item) => (
                <div
                  key={Object.keys(item)[0]}
                  className={styles.searchSelectionCard}
                  onClick={() => {
                    props.clicked(`${Object.keys(item)[0]}`);
                  }}
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
        <div className={styles.categorySpecificSelection}>
          {categoryMapping?.map((item) => (
            <div
              key={Object.keys(item)[0]}
              className={styles.searchSelectionCard}
              onClick={() => {
                props.clicked(`${Object.keys(item)[0]}`);
              }}
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

CategorySearchOptions.propTypes = {
  category: PropTypes.string,
  gender: PropTypes.string,
  clicked: PropTypes.func,
};

export default CategorySearchOptions;
