import React, { useEffect, useRef } from "react";
import { X } from "react-feather";

import Modal from "components/Modal/Modal";

import styles from "./OffersModal.module.scss";

function OffersModal({
  offers = [],
  onClose,
  bestOfferIndex = -1,
  autoScrollToBestOffer = false,
}) {
  const bestOfferDivRef = useRef();

  useEffect(() => {
    if (bestOfferDivRef?.current && autoScrollToBestOffer)
      bestOfferDivRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <Modal onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.heading}>Available Offers</p>

          <div className="icon" onClick={() => (onClose ? onClose() : "")}>
            <X />
          </div>
        </div>

        <div className={styles.offers}>
          {offers.map((item, index) => (
            <div
              ref={index == bestOfferIndex ? bestOfferDivRef : null}
              className={`${styles.offer} ${
                index == bestOfferIndex ? styles.best : ""
              }`}
              key={index}
            >
              <p>
                {index + 1}. {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default OffersModal;
