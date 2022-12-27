import React, { useRef, useEffect } from "react";

import styles from "./Dropdown.module.scss";

function Dropdown({ onClose, children, startFromRight, className }) {
  const dropdown = useRef();

  const handleClick = (event) => {
    if (
      dropdown.current &&
      !dropdown.current.contains(event.target) &&
      onClose
    ) {
      onClose();
    }
  };

  useEffect(() => {
    setTimeout(() => {
      document.addEventListener("click", handleClick);
    }, 500);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div
      ref={dropdown}
      className={`${styles.dropDown} ${
        startFromRight ? styles.startFromRight : ""
      } ${className ? className : ""}`}
      onClick={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  );
}

export default Dropdown;
