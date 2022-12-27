import React from "react";
import PropTypes from "prop-types";
import { Share2, Star } from "react-feather";

import { platformAnalytics } from "api/analytics/analytics";

import { allScrappersList, logoMappingWithScrapper } from "constants.js";
import { extractNumberFromStringWithLimit, numberToKConvertor } from "util";

import styles from "./Fashion.module.scss";

function Fashion(props) {
  const connectionId = props?.connectionId;
  const data = { ...props.details };
  const from = props.from || "";

  const abbreviateString = (value) => {
    if (!value) return "0";

    const reviews = extractNumberFromStringWithLimit(value);
    return numberToKConvertor(reviews);
  };

  const handleImageError = (event) => {
    let img;
    if (from == allScrappersList.flipkart)
      img = data.image
        .replace("http", "https")
        .replace("rukmini1", "rukminim2");
    else if (from == allScrappersList.tatacliq)
      img = data.image.replace("//", "https://");

    event.target.src = img;
  };

  const handleAnalytics = async (from, connectionId) => {
    if (!from || !connectionId) return;
    const res = await platformAnalytics(from, connectionId);
    if (!res) {
      return;
    }
    return;
  };

  const handleShare = () => {
    window.navigator.share({
      title: "comparable",
      url: data.link,
      text: `${data.title} \n\nPrice - ${data.formattedPrice} \n\nShared from Comparable❤️\n`,
    });
  };

  return (
    <div className={styles.fashion}>
      <div className={styles.tags}>
        <div className={`${styles.share} ${styles.tag}`} onClick={handleShare}>
          <p>Share </p>
          <Share2 />
        </div>

        <div className={styles.tag}>
          <img
            src={logoMappingWithScrapper[allScrappersList[from]]?.rect || ""}
            alt={from}
            loading="lazy"
          />
        </div>
      </div>
      <a
        href={data?.link}
        target="_blank"
        onClick={() => handleAnalytics(from, connectionId)}
      >
        <div className={styles.image}>
          <img
            src={data.image}
            onError={handleImageError}
            alt={data.title}
            loading="lazy"
          />
          {data?.ratings !== {} ? (
            <div className={styles.ratingSection}>
              {data?.ratings?.rating && parseInt(data?.ratings?.rating) >= 1 ? (
                <div
                  className={`${styles.rating} ${
                    data?.ratings?.totalReviews &&
                    data?.ratings?.totalReviews !== 0
                      ? styles.activePartition
                      : ""
                  }`}
                >
                  <p>
                    {parseFloat(data?.ratings?.rating).toFixed(1)}{" "}
                    <Star className={styles.filledStar} />
                  </p>
                </div>
              ) : (
                ""
              )}
              {data?.ratings?.totalReviews &&
              data?.ratings?.totalReviews !== 0 ? (
                <div className={styles.reviews}>
                  <p>{abbreviateString(data?.ratings?.totalReviews)}</p>
                </div>
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}
        </div>
      </a>

      <div className={styles.details}>
        <p className={styles.brandName}>{data?.brand}</p>
        <a
          href={data?.link}
          target="_blank"
          onClick={() => handleAnalytics(from, connectionId)}
        >
          <p className={styles.title}>
            {data.title.length > 18
              ? data.title.slice(0, 35) + "..."
              : data.title}
          </p>
        </a>

        <div className={styles.priceSection}>
          <p className={styles.discountedPrice}>{data.formattedPrice}</p>
        </div>
      </div>
    </div>
  );
}

Fashion.propTypes = {
  connectionId: PropTypes.string,
  details: PropTypes.object,
  from: PropTypes.string,
};

export default Fashion;
