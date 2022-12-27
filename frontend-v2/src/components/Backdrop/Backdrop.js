import React, { useEffect } from "react";

import styles from "./Backdrop.module.scss";

function Backdrop({ children, className, onClose }) {
  useEffect(() => {
    const isHidden = document.body.style.overflowY === "hidden";
    if (!isHidden) document.body.style.overflowY = "hidden";

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div
        className={styles.backdrop}
        onClick={() => (onClose ? onClose() : "")}
      />
      {children}
    </div>
  );
}

export default Backdrop;
