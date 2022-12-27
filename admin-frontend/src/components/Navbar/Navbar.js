import React from "react";
import { Link } from "react-router-dom";

import logo from "assets/logo1.png";

import styles from "./Navbar.module.scss";

function Navbar() {
  return (
    <div className={styles.container}>
      <Link to="/">
        <div className={styles.logo}>
          <img src={logo} alt="Comparable" />
          <p>omparable</p>
        </div>
      </Link>
    </div>
  );
}

export default Navbar;
