import React from "react";

import styles from "./Spinner.module.scss";

function Spinner({ small, white }) {
  return (
    <div
      className={`${styles.container} ${small ? styles.small : ""} ${
        white ? styles.white : ""
      }`}
    >
      <div className={styles.circle} />
    </div>
  );
}

export default Spinner;
