import React from "react";

import styles from "./ProgressBar.module.scss";

function ProgressBar({ progress = 0 }) {
  return (
    <div className={styles.container}>
      <div className={styles.progress} style={{ width: `${progress}%` }} />
    </div>
  );
}

export default ProgressBar;
