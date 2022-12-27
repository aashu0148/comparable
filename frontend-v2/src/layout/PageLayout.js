import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Head from "next/head";

import Navbar from "components/Navbar/Navbar";

import actionTypes from "store/actionTypes";

import styles from "./layout.module.scss";

export const PageLayout = ({ title, children }) => {
  const dispatch = useDispatch();

  const [isMobileView, setIsMobileView] = useState("");

  const handleResize = (event) => {
    const width = event.target.outerWidth;
    if (width < 768) setIsMobileView(true);
    else setIsMobileView(false);
  };

  useEffect(() => {
    if (typeof isMobileView !== "boolean") {
      setIsMobileView(window.outerWidth < 768);
      dispatch({
        type: actionTypes.SET_MOBILE_VIEW,
        isMobileView: window.outerWidth < 768,
      });
    } else
      dispatch({
        type: actionTypes.SET_MOBILE_VIEW,
        isMobileView,
      });
  }, [isMobileView]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <Head>
        <meta content={title} property="twitter:title" />
        <meta content={title} property="og:title" />
        <title>{title}</title>
      </Head>

      <div className={styles.container}>
        <Navbar />
        <div className={styles.inner}>{children}</div>
      </div>
    </>
  );
};
