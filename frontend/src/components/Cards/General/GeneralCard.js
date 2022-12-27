import React, { useState } from "react";
import PropTypes from "prop-types";
import { Share2 } from "react-feather";

import Modal from "components/Modal/Modal";
import Tooltip from "components/Tooltip/Tooltip";

import { platformAnalytics } from "api/analytics/analytics";
import {
  extractNumberFromStringWithLimit,
  generateRatingStars,
  numberToKConvertor,
  readOffersAndReturnMax,
} from "util.js";
import { allScrappersList, logoMappingWithScrapper } from "constants.js";

import styles from "./GeneralCard.module.scss";

function GeneralCard(props) {
  const connectionId = props?.connectionId;
  const details = { ...props.details };
  const screenWidth = window.screen.width;
  const isCardLoading = props.loading ? true : false;
  const maxCharacterLimit = screenWidth / 13;

  const [showKeyFeaturesModal, setShowKeyFeaturesModal] = useState(false);
  const [showOffersModal, setShowOffersModal] = useState(false);

  const from = props.from || "";
  const isOfferCard = [
    allScrappersList.amazon,
    allScrappersList.flipkart,
    allScrappersList.croma,
    allScrappersList.reliance,
    allScrappersList.tatacliq,
  ].some((item) => item == from);
  const reviews = details?.ratings?.totalReviews
    ? extractNumberFromStringWithLimit(details?.ratings?.totalReviews)
    : "";
  const offers = isOfferCard
    ? details.offers && Array.isArray(details.offers)
      ? [...details.offers]
      : ""
    : "";
  const offersLoaded = details?.offersLoaded;
  // const firstOfferText = offers ? offers[0] : "";
  const keyFeatures = details?.keySpecs;
  const firstKeyFeature = keyFeatures ? keyFeatures[0] : "";

  const handleImageError = (event) => {
    let img;
    if (from == allScrappersList.flipkart)
      img = details.image
        .replace("http", "https")
        .replace("rukmini1", "rukminim2");
    else if (from == allScrappersList.tatacliq)
      img = details.image.replace("//", "https://");
    else return;

    event.target.src = img;
  };
  let offerPrice = 0,
    bestOfferIndex = -1;
  if (offers) {
    const offer = readOffersAndReturnMax(offers, details.price, details.from);
    if (offer?.discount && offer?.discount > 0) {
      offerPrice = details?.price - offer?.discount;
      bestOfferIndex = offer.offerIndex;
    }
  }

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
      url: details.link,
      text: `${details.title} \n\nPrice - ${details.formattedPrice} ${
        offerPrice
          ? `\n\nOffer Price - ${offerPrice.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
              style: "currency",
              currency: "INR",
            })} \n\nOffer - ${offers[bestOfferIndex]}`
          : ""
      } \n\nShared from Comparable❤️\n`,
    });
  };

  return (
    <div
      className={`${styles.container} ${
        isCardLoading ? styles.loadingContainer : ""
      }`}
    >
      {showOffersModal && (
        <Modal
          isMobileModal={true}
          title="Available Offers"
          onClose={() => setShowOffersModal(false)}
        >
          <div className={styles.offersModal}>
            {offers.map((item, index) => (
              <li
                key={index + item.slice(-5)}
                className={index == bestOfferIndex ? styles.selected : ""}
              >
                {item}
              </li>
            ))}
          </div>
        </Modal>
      )}

      {showKeyFeaturesModal && (
        <Modal
          isMobileModal={true}
          title="Key Specs"
          onClose={() => setShowKeyFeaturesModal(false)}
        >
          <div className={styles.keyFeaturesModal}>
            {keyFeatures.map((item, index) => (
              <li key={index + item.slice(0, 5)}>{item}</li>
            ))}
          </div>
        </Modal>
      )}

      {!isCardLoading && (
        <div className={styles.tags}>
          <div
            className={`${styles.share} ${styles.tag}`}
            onClick={handleShare}
          >
            <p>Share </p>
            <Share2 />
          </div>

          <div className={styles.tag}>
            <img
              src={logoMappingWithScrapper[from]?.rect}
              alt={from}
              loading="lazy"
            />
          </div>
        </div>
      )}

      {!isCardLoading ? (
        <>
          <div className={styles.left}>
            <a
              href={details?.link}
              target="_blank"
              onClick={() => handleAnalytics(from, connectionId)}
            >
              <img
                src={details.image}
                onError={handleImageError}
                alt={details.title}
                loading="lazy"
              />
            </a>
          </div>
          <div className={styles.right}>
            <a
              href={details?.link}
              target="_blank"
              onClick={() => handleAnalytics(from, connectionId)}
            >
              <p className={styles.title} title={details.title}>
                {details.title
                  ? details.title?.length > 100
                    ? `${details.title.slice(0, 97)}...`
                    : details?.title
                  : ""}
              </p>
            </a>
            <div className={styles.ratingsContainer}>
              {generateRatingStars(
                details?.ratings?.rating,
                styles.star,
                styles.filledStar
              )}

              {reviews && (
                <p className={styles.reviews}>
                  ({numberToKConvertor(reviews)})
                </p>
              )}
            </div>
            {firstKeyFeature && (
              <p className={`${styles.offerText} ${styles.keyFeature}`}>
                {firstKeyFeature.length > maxCharacterLimit - 3 ||
                keyFeatures.length > 1
                  ? firstKeyFeature.slice(0, maxCharacterLimit - 3 - 2) + "..."
                  : firstKeyFeature}
                {firstKeyFeature.length > maxCharacterLimit - 3 ||
                keyFeatures.length > 1 ? (
                  <span onClick={() => setShowKeyFeaturesModal(true)}>
                    view
                  </span>
                ) : (
                  ""
                )}
              </p>
            )}
            {/* 
            {firstOfferText && (
              <p className={styles.offerText}>
                {firstOfferText.length > maxCharacterLimit
                  ? firstOfferText.slice(0, maxCharacterLimit - 2) + "..."
                  : firstOfferText}
                {firstOfferText.length > maxCharacterLimit ? (
                  <span onClick={() => setShowOffersModal(true)}>view</span>
                ) : (
                  ""
                )}
              </p>
            )} */}
            <div className={styles.pricesContainer}>
              {offerPrice ? (
                <div className={styles.offerPriceContainer}>
                  <p className={styles.price}>
                    {offerPrice.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                      style: "currency",
                      currency: "INR",
                    })}{" "}
                  </p>
                  with{" "}
                  <span onClick={() => setShowOffersModal(true)}>
                    this offer
                  </span>
                </div>
              ) : (
                ""
              )}

              <div className={styles.priceContainer}>
                <p
                  className={styles.price}
                  style={{ textDecoration: offerPrice ? "line-through" : "" }}
                >
                  {details.formattedPrice}
                </p>

                {isOfferCard ? (
                  offersLoaded ? (
                    Array.isArray(offers) && offers.length == 0 ? (
                      ""
                    ) : (
                      <Tooltip
                        text={
                          offers
                            ? offers.length > 0
                              ? `${
                                  offers && Array.isArray(offers)
                                    ? offers.length
                                    : ""
                                } Offers available`
                              : "No offers found :("
                            : "Currently offers are only fetched for few products from any platform. Please bare with us, we will improve this in future."
                        }
                        topRight
                        width={offers ? "" : "180px"}
                      >
                        <p
                          className={`${styles.offer} ${
                            offers && offers.length > 0 ? "" : styles.grayed
                          }`}
                          onClick={() =>
                            offers && offers.length > 0
                              ? setShowOffersModal(true)
                              : ""
                          }
                        >
                          {offers && Array.isArray(offers)
                            ? offers.length || ""
                            : ""}{" "}
                          Offers
                        </p>
                      </Tooltip>
                    )
                  ) : (
                    <div className={`loading ${styles.offersLoading}`} />
                  )
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={`loading ${styles.left}`}></div>
          <div className={styles.right}>
            <div className={`loading ${styles.top}`} />
            <div className={`loading ${styles.middle}`} />
            <div className={styles.footer}>
              <span className={`loading ${styles.footerLeft}`} />
              <span className={`loading ${styles.footerRight}`} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

GeneralCard.propTypes = {
  loading: PropTypes.bool,
  from: PropTypes.string,
  details: PropTypes.object,
  connectionId: PropTypes.string,
};

export default GeneralCard;
