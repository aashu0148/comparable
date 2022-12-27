import React from "react";
import PropTypes from "prop-types";
import { Triangle } from "react-feather";

import styles from "./Tooltip.module.scss";

function Tooltip(props) {
  return (
    <div className={styles.container}>
      <div
        className={`${styles.tooltipContainer} ${
          props.left
            ? styles.left
            : props.bottom
            ? styles.bottom
            : props.right
            ? styles.right
            : props.top
            ? styles.top
            : props.topLeft
            ? styles.topLeft
            : props.topRight
            ? styles.topRight
            : styles.top
        }`}
        style={{ width: props.width }}
        // onMouseDown={(event)}
      >
        <Triangle className={styles.triangle} />
        {props.text}
      </div>
      {props.children}
    </div>
  );
}

Tooltip.propTypes = {
  width: PropTypes.string,
  text: PropTypes.string,
  left: PropTypes.bool,
  top: PropTypes.bool,
  topLeft: PropTypes.bool,
  topRight: PropTypes.bool,
  right: PropTypes.bool,
  bottom: PropTypes.bool,
};

export default Tooltip;
