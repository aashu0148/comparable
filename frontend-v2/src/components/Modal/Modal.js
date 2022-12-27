import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useSelector } from "react-redux";
import { X } from "react-feather";

import styles from "./Modal.module.scss";

function Modal({ title, onClose, doNotAnimate, noTopPadding, ...props }) {
  const isMobileView = useSelector((state) => state.root.mobileView);

  useEffect(() => {
    if (isMobileView) {
      document.body.style.overflowY = "hidden";
    }

    const isHidden = document.body.style.overflowY === "hidden";
    if (!isHidden) document.body.style.overflowY = "hidden";

    return () => {
      document.body.style.overflowY = "auto";
    };
  }, []);

  const modalDiv = isMobileView ? (
    <div
      className={`${styles.mobileContainer} ${
        title || noTopPadding ? styles.modalWithTitle : ""
      } ${props.className}`}
      onClick={() => (onClose ? onClose() : "")}
      style={{ zIndex: +props.zIndex || "" }}
    >
      <div
        className={`${styles.inner} custom-scroll`}
        onClick={(event) => event.stopPropagation()}
      >
        {title && (
          <div className={styles.modalTitle}>
            <div className={styles.heading}>{title}</div>
            {onClose && <X onClick={onClose} />}
          </div>
        )}
        {props.children}
      </div>
    </div>
  ) : (
    <div
      className={`${styles.container} ${props.className}`}
      onClick={() => (onClose ? onClose() : "")}
    >
      <div
        className={`${styles.inner} ${
          doNotAnimate ? styles.preventAnimation : ""
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {props.children}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalDiv, document.body);
}

export default Modal;
