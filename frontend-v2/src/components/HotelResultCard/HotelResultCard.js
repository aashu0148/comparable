import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { Share2, Star } from "react-feather";

import { allScrappersList, logoMappingWithScrapper } from "utils/constants";
import { numberToKConvertor } from "utils/util";

import styles from "./HotelResultCard.module.scss";

function HotelResultCard({ details, grouped }) {
  const isGrouped = Array.isArray(grouped);
  if (isGrouped) grouped.sort((a, b) => (a.price < b.price ? -1 : 1));
  const cheapestGroupItem = isGrouped
    ? grouped.reduce(
        (acc, curr) =>
          acc.price ? (acc.price > curr.price ? curr : acc) : curr,
        {}
      )
    : {};
  const anchorRef = useRef();
  const isMobileView = useSelector((state) => state.root.mobileView);

  const handleShare = (event) => {
    if (event?.stopPropagation) event.stopPropagation();

    if (window.navigator.share)
      window.navigator.share({
        title: "Comparable",
        url: isGrouped ? cheapestGroupItem.link : details.link,
        text: `${details.name} \n\nPrice - ${
          isGrouped ? cheapestGroupItem.formattedPrice : details.formattedPrice
        } \n\nShared from Comparable❤️\n`,
      });
  };

  return (
    <div className={styles.outerContainer}>
      <div
        className={`${styles.container} ${isGrouped ? styles.combined : ""}`}
        onClick={() => (anchorRef?.current ? anchorRef.current.click() : "")}
      >
        <a
          ref={anchorRef}
          target={"_blank"}
          rel="noreferrer"
          href={isGrouped ? cheapestGroupItem.link : details.link}
        />

        {isGrouped ? (
          ""
        ) : (
          <div className={`${styles.tag} ${styles.platform}`}>
            <img
              src={logoMappingWithScrapper[allScrappersList[details.from]].rect}
              alt={allScrappersList[details.from]}
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className={`${styles.tag} ${styles.share}`} onClick={handleShare}>
          <Share2 />
          <p>Share</p>
        </div>

        <div className={styles.left}>
          <img
            src={details.image || ""}
            alt={details.name}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className={styles.right}>
          <div className={styles.inner}>
            <div className={styles.header}>
              <div className={styles.top}>
                <p className={styles.title}>
                  {isMobileView
                    ? details.name?.length > 103
                      ? details.name?.slice(0, 103) + "..."
                      : details.name
                    : details.name}
                </p>
                {details.ratings?.obtained > 1 ? (
                  <div className={styles.ratings}>
                    <div className={styles.rating}>
                      <p>{details.rating}</p> <Star />
                    </div>
                    {details.reviews ? (
                      <p className={styles.review}>
                        {numberToKConvertor(details.reviews)} reviews
                      </p>
                    ) : (
                      ""
                    )}
                  </div>
                ) : (
                  ""
                )}
              </div>

              <p className={styles.desc}>{details.area}</p>
            </div>

            <div className={styles.extraInfo}>
              {Array.isArray(details.extraInfo) && details.extraInfo.length > 0
                ? details.extraInfo.map((item, index) => (
                    <div className={styles.info} key={index}>
                      - {item}
                    </div>
                  ))
                : ""}
            </div>

            {!isGrouped && (
              <div
                className={styles.priceSection}
                onClick={(event) => event.stopPropagation()}
              >
                <p className={styles.offerPrice}>{details.formattedPrice}</p>
              </div>
            )}
          </div>

          {isGrouped ? (
            <>
              <div className={styles.groups}>
                {grouped.map((item) => (
                  <div
                    className={`${styles.platformBtn} ${
                      cheapestGroupItem.id == item.id ? styles.best : ""
                    }`}
                    key={item.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      setTimeout(() => window.open(item.link));
                    }}
                  >
                    <p>{item.formattedPrice}</p>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList[item.from]]
                          ?.rect
                      }
                      alt={allScrappersList[item.from]}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}

export default HotelResultCard;
