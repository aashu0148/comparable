import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate, useLocation } from "react-router-dom";
import { X } from "react-feather";

import styles from "./Modal.module.scss";

function Modal(props) {
  const navigate = useNavigate();
  const location = useLocation();

  const isMobileModal =
    typeof props.isMobileModal === "boolean"
      ? props.isMobileModal
      : window.outerWidth < 768;
  const [justMounted, setJustMounted] = useState(true);

  const handleURLParamsOnUnmount = () => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    if (!params.get("modal")) return;
    navigate(-1);
  };

  const handleURLParamsOnMount = () => {
    const params = new URLSearchParams(location.search);
    if (params.get("modal")) return;
    params.append("modal", "true");
    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });
  };

  const handleLocationChange = () => {
    const params = new URLSearchParams(location.search);
    if (!params.get("modal") && !justMounted && props.onClose) props.onClose();
  };

  useEffect(() => {
    handleLocationChange();
  }, [location]);

  useEffect(() => {
    if (isMobileModal) {
      setTimeout(() => setJustMounted(false), 1000);
      document.body.style.overflowY = "hidden";
      handleURLParamsOnMount();
    }
    const isHidden = document.body.style.overflowY === "hidden";
    if (!isHidden) document.body.style.overflowY = "hidden";

    return () => {
      handleURLParamsOnUnmount();
      document.body.style.overflowY = "auto";
    };
  }, []);

  return isMobileModal ? (
    <div
      className={`${styles.mobileContainer} ${
        props.title || props.noTopPadding ? styles.modalWithTitle : ""
      } ${props.className}`}
      onClick={() => (props.onClose ? props.onClose() : "")}
      style={{ zIndex: +props.zIndex || "" }}
    >
      <div
        className={`${styles.inner} custom-scroll`}
        onClick={(event) => event.stopPropagation()}
      >
        {props.title && (
          <div className={styles.modalTitle}>
            <div className={styles.heading}>{props.title}</div>
            {props.onClose && <X onClick={props.onClose} />}
          </div>
        )}
        {props.children}
      </div>
    </div>
  ) : (
    <div
      className={`${styles.container} ${props.className}`}
      onClick={() => (props.onClose ? props.onClose() : "")}
    >
      <div
        className={`${styles.inner} ${
          props.doNotAnimate ? styles.preventAnimation : ""
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {props.children}
      </div>
    </div>
  );
}

Modal.propTypes = {
  title: PropTypes.string,
  noTopPadding: PropTypes.bool,
  onClose: PropTypes.func,
  doNotAnimate: PropTypes.bool,
  isMobileModal: PropTypes.bool,
};

export default Modal;
