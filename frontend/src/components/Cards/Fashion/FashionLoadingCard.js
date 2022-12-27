import React from "react";

import styles from "./Fashion.module.scss";

function FashionLoadingCard() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.image}>
        <div className="loading" />
      </div>
      <div className={styles.details}>
        <p className={`loading ${styles.detail}`}></p>
        <p className={`loading ${styles.price}`}></p>
      </div>
    </div>
  );
}

export default FashionLoadingCard;
