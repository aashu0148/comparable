import React from "react";
import { ArrowRight } from "react-feather";

import styles from "./button.module.scss";

export const Button = ({
  className,
  children,
  onClick,
  disabled = false,
  outlineButton,
  redButton,
  greenButton,
  cancelButton,
  withArrow,
  ...inputProps
}) => {
  return (
    <button
      type={inputProps.type || "button"}
      onClick={(event) => (onClick ? onClick(event) : "")}
      disabled={disabled ? true : false}
      className={`${styles.button} ${
        outlineButton ? styles["button-outline"] : ""
      } ${disabled ? styles["button-disabled"] : ""} ${className || ""} ${
        disabled && outlineButton ? styles["outline-button-disabled"] : ""
      }
        ${redButton ? styles.buttonDelete : ""} 
        ${greenButton ? styles.buttonGreen : ""}  
        ${cancelButton ? styles["button-cancel"] : ""}
        `}
      {...inputProps}
    >
      {children}
      {withArrow ? <ArrowRight className={styles.icon} /> : ""}
    </button>
  );
};
