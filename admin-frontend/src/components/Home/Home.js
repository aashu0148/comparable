import React from "react";
import { Link } from "react-router-dom";

import styles from "./Home.module.scss";

function Home(props) {
  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        Welcome to <span>Comparable</span>
      </div>

      <div className={styles.buttons}>
        <Link to="/analytics">
          <p className={styles.button}>Analytics</p>
        </Link>
        <Link to="/feedback">
          <p className={styles.button}>Feedbacks</p>
        </Link>
      </div>
    </div>
  );
}

export default Home;
