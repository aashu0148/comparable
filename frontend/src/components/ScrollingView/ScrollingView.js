import React from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";

import GeneralCard from "components/Cards/General/GeneralCard";
import Fashion from "components/Cards/Fashion/Fashion";
import FashionLoadingCard from "components/Cards/Fashion/FashionLoadingCard";

import { availableCategories } from "constants";

import styles from "./ScrollingView.module.scss";

function ScrollingView(props) {
  const connectionId = props?.connectionId;
  const { data, expectedFrom } = props;
  const { category } = useParams();
  const isFashionCategory =
    category == availableCategories.fashion ? true : false;

  return (
    <div className={styles.container}>
      {Array.isArray(expectedFrom)
        ? expectedFrom.map((item) => {
            const result = data[item] || "";

            return (
              <div className={styles.section} key={item}>
                <p className={styles.title}>{item} results</p>
                <div className={styles.cardsContainer}>
                  <div className={styles.cards}>
                    {result ? (
                      result.length > 0 ? (
                        result.map((elem, index) => {
                          return isFashionCategory ? (
                            <Fashion
                              connectionId={connectionId}
                              from={item}
                              key={elem.id + index}
                              details={elem}
                            />
                          ) : (
                            <GeneralCard
                              connectionId={connectionId}
                              from={item}
                              key={elem.id + index}
                              details={elem}
                            />
                          );
                        })
                      ) : (
                        <div className={`${styles.empty}`}>
                          <p className={styles.emoji}>😥</p>
                          <p className={styles.title}>Can't find on {item}.</p>
                          <p className={styles.desc}>
                            If you think that the platform must have results for
                            what you searched then try searching the same{" "}
                            <span
                              onClick={() =>
                                props.refresh ? props.refresh() : ""
                              }
                            >
                              again
                            </span>
                          </p>
                        </div>
                      )
                    ) : isFashionCategory ? (
                      <>
                        <FashionLoadingCard />
                        <FashionLoadingCard />
                        <FashionLoadingCard />
                        <FashionLoadingCard />
                      </>
                    ) : (
                      <>
                        <GeneralCard loading />
                        <GeneralCard loading />
                        <GeneralCard loading />
                        <GeneralCard loading />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        : ""}
    </div>
  );
}

ScrollingView.propTypes = {
  connectionId: PropTypes.string,
  data: PropTypes.object,
  expectedFrom: PropTypes.array,
  refresh: PropTypes.func,
};

export default ScrollingView;
