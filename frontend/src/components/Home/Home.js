import React from "react";
import { Link } from "react-router-dom";

import {
  allScrappersList,
  availableCategories,
  logoMappingWithScrapper,
} from "constants.js";

import gearIcon from "assets/icons/gearIcon.png";

import styles from "./Home.module.scss";

function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.shadedBox} />
      <div className={styles.betaSection}>
        <div className={styles.betaContainer}>
          <img src={gearIcon} alt="Beta Icon" />
          <p>
            Currently we are in Beta Phase. If you find any bug in the app then
            please write us in the feedback so we can improve user experience
          </p>
        </div>
      </div>
      <div className={styles.header}>
        <h1 className={styles.title}>Comparable</h1>
        <p className={styles.subTitle}>
          We helps you <span>compare</span>
        </p>
        <p className={styles.desc}>
          Comparable finds the stuff you needed all over the internet and brings
          up all the results for you to help you compare and get the best value.
        </p>
      </div>

      <div className={styles.body}>
        {/* <Link to={`/search/${availableCategories.general}`}>
            <div className={`${styles.box} ${styles.generalBox}`}>
              <div className={styles.categoryCircle}>
                <div className={styles.imageSection}>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.amazon].square
                      }
                      alt="General"
                    />
                  </div>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.flipkart]
                          .square
                      }
                      alt="General"
                    />
                  </div>
                </div>
                <div className={styles.imageSection}>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.snapdeal]
                          .square
                      }
                      alt="General"
                    />
                  </div>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.tatacliq]
                          .square
                      }
                      alt="General"
                    />
                  </div>
                </div>
              </div>
              <p className={styles.name}>General</p>
            </div>
          </Link> */}
        <div className={styles.cards}>
          <Link to={`/search/${availableCategories.electronics}`}>
            <div className={`${styles.box} ${styles.electronicsBox}`}>
              <div className={styles.categoryCircle}>
                <div className={styles.imageSection}>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.flipkart]
                          .square
                      }
                      alt="Electronics"
                    />
                  </div>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.amazon].square
                      }
                      alt="Electronics"
                    />
                  </div>
                </div>
                <div className={styles.imageSection}>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.croma].square
                      }
                      alt="Electronics"
                    />
                  </div>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.reliance]
                          .square
                      }
                      alt="Electronics"
                    />
                  </div>
                </div>
              </div>
              <p className={styles.name}>Electronics</p>
            </div>
          </Link>
          <Link to={`/search/fashionSelect`}>
            <div className={`${styles.box} ${styles.fashionBox}`}>
              <div className={styles.categoryCircle}>
                <div className={styles.imageSection}>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.amazon].square
                      }
                      alt="Ajio"
                    />
                  </div>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.nykaa].square
                      }
                      alt="Ajio"
                    />
                  </div>
                </div>
                <div className={styles.imageSection}>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.ajio].square
                      }
                      alt="Ajio"
                    />
                  </div>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.snapdeal]
                          .square
                      }
                      alt="Ajio"
                    />
                  </div>
                </div>
              </div>
              <p className={styles.name}>Fashion</p>
            </div>
          </Link>
          <Link to={`/search/${availableCategories.custom}`}>
            <div className={`${styles.box} ${styles.mobilesBox}`}>
              <div className={styles.categoryCircle}>
                <div className={styles.imageSection}>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.shopclues]
                          .square
                      }
                      alt="General"
                    />
                  </div>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.tatacliq]
                          .square
                      }
                      alt="General"
                    />
                  </div>
                </div>
                <div className={styles.imageSection}>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.amazon].square
                      }
                      alt="General"
                    />
                  </div>
                  <div className={styles.image}>
                    <img
                      src={
                        logoMappingWithScrapper[allScrappersList.flipkart]
                          .square
                      }
                      alt="General"
                    />
                  </div>
                </div>
              </div>
              <p className={styles.name}>Custom</p>
            </div>
          </Link>
        </div>
        <div className={styles.row}></div>
      </div>
    </div>
  );
}

export default Home;
