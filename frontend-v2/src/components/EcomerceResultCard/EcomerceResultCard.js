import React, { useRef, useState } from "react";
import { Share2, Star } from "react-feather";
import { useSelector } from "react-redux";

import { Button } from "components/Button";
import OffersModal from "./OffersModal/OffersModal";
import FeaturesModal from "./FeaturesModal/FeaturesModal";

import { allScrappersList, logoMappingWithScrapper } from "utils/constants";
import {
  getFormattedPrice,
  numberToKConvertor,
  readOffersAndReturnMax,
} from "utils/util";

import styles from "./EcomerceResultCard.module.scss";

function EcomerceResultCard({ isCombined, details = {} }) {
  const anchorRef = useRef();
  const isMobileView = useSelector((state) => state.root.mobileView);

  const [showOffersModal, setShowOffersModal] = useState(false);
  const [autoScrollToBestOffer, setAutoScrollToBestOffer] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);

  let offerPrice = 0,
    bestOfferIndex = -1;
  if (details.offers && details.offersPresent) {
    const offer = readOffersAndReturnMax(
      details.offers,
      details.price,
      details.from
    );
    if (offer.discount && offer.discount > 0) {
      offerPrice = details.price - offer?.discount;
      if (offerPrice < 10) {
        offerPrice = details.price;
        bestOfferIndex = -1;
      } else {
        bestOfferIndex = offer.offerIndex;
      }
    }
  }

  const handleShare = (event) => {
    if (event?.stopPropagation) event.stopPropagation();

    window.navigator.share({
      title: "Comparable",
      url: details.link,
      text: `${details.title} \n\nPrice - ${details.formattedPrice} ${
        offerPrice
          ? `\n\nOffer Price - ${offerPrice.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
              style: "currency",
              currency: "INR",
            })} \n\nOffer - ${details.offers[bestOfferIndex]}`
          : ""
      } \n\nShared from Comparable❤️\n`,
    });
  };

  const handleImageError = (event) => {
    let img;
    if (details.from == allScrappersList.flipkart)
      img = details.image
        .replace("http", "https")
        .replace("rukmini1", "rukminim2");
    else if (details.from == allScrappersList.tatacliq)
      img = details.image?.replace("//", "https://");
    else return;

    event.target.src = img;
  };

  return (
    <div className={styles.outerContainer}>
      {showOffersModal && (
        <OffersModal
          onClose={() => {
            setShowOffersModal(false);
            setAutoScrollToBestOffer(false);
          }}
          offers={details.offers}
          bestOfferIndex={bestOfferIndex}
          autoScrollToBestOffer={autoScrollToBestOffer}
        />
      )}
      {showFeaturesModal && (
        <FeaturesModal
          onClose={() => setShowFeaturesModal(false)}
          features={details.keySpecs}
        />
      )}

      <div
        className={`${styles.container} ${isCombined ? styles.combined : ""}`}
        onClick={() => (anchorRef?.current ? anchorRef.current.click() : "")}
      >
        <a
          ref={anchorRef}
          target={"_blank"}
          rel="noreferrer"
          href={details.link}
        />

        <div className={`${styles.tag} ${styles.platform}`}>
          <img
            src={logoMappingWithScrapper[allScrappersList[details.from]]?.rect}
            alt={allScrappersList[details.from]}
            referrerPolicy="no-referrer"
          />
        </div>

        <div className={`${styles.tag} ${styles.share}`} onClick={handleShare}>
          <Share2 />
          <p>Share</p>
        </div>

        <div className={styles.left}>
          <img
            src={details.image || ""}
            alt={details.title}
            loading="lazy"
            onError={handleImageError}
            referrerPolicy="no-referrer"
          />
        </div>
        <div className={styles.right}>
          <div>
            <p className={styles.title}>
              {isMobileView
                ? details.title?.length > 103
                  ? details.title?.slice(0, 103) + "..."
                  : details.title
                : details.title}
            </p>
            {details.ratings?.rating > 1 ? (
              <div className={styles.ratings}>
                <div className={styles.rating}>
                  <p>{details.ratings?.rating}</p> <Star />
                </div>
                {details.ratings?.totalReviews > 0 ? (
                  <p className={styles.review}>
                    {numberToKConvertor(details.ratings?.totalReviews)} reviews
                  </p>
                ) : (
                  ""
                )}
              </div>
            ) : (
              ""
            )}
          </div>

          <div
            className={styles.buttons}
            onClick={(event) => event.stopPropagation()}
          >
            {details.offersPresent &&
            ((details.offersLoaded && details.offers?.length > 0) ||
              !details.offersLoaded) ? (
              <Button
                outlineButton
                className={!details.offersLoaded ? "loading" : ""}
                disabled={!details.offersLoaded}
                onClick={() => setShowOffersModal(true)}
              >
                {isMobileView
                  ? `${details.offers?.length || ""} Offers`
                  : `${details.offers?.length || ""} Available offers`}
              </Button>
            ) : (
              ""
            )}

            {details.keySpecs && details.keySpecs?.length > 0 ? (
              <Button onClick={() => setShowFeaturesModal(true)}>
                {isMobileView ? "Features" : "Key features"}
              </Button>
            ) : (
              ""
            )}
          </div>

          {details.offersPresent &&
          details.offers?.length == 0 &&
          details.offersLoaded ? (
            <p className={styles.info}>
              Currently offers are only fetched for few products, stay with us
              this will surely be improved in near future
            </p>
          ) : (
            ""
          )}

          <div
            className={styles.priceSection}
            onClick={(event) => event.stopPropagation()}
          >
            {offerPrice ? (
              <>
                <del className={styles.originalPrice}>
                  {details.formattedPrice}
                </del>
                <p className={styles.offerPrice}>
                  {getFormattedPrice(offerPrice, 0)}
                </p>
                <p className={styles.text}>
                  with this{" "}
                  <span
                    onClick={() => {
                      setShowOffersModal(true);
                      setAutoScrollToBestOffer(true);
                    }}
                  >
                    Offer
                  </span>
                </p>
              </>
            ) : (
              <p className={styles.originalPrice}>{details.formattedPrice}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EcomerceResultCard;
