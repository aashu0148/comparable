import React, { useRef } from "react";
import { useRouter } from "next/router";

import { Button } from "components/Button";

import styles from "./HomePage.module.scss";

function HomePage() {
  const whyRef = useRef();
  const router = useRouter();

  return (
    <div className={styles.container}>
      <img
        src="/images/polkaDot.svg"
        alt="comparable"
        className={styles.polkaDot}
      />

      <div className={styles.header}>
        <div className={styles.left}>
          <p className={styles.title}>
            We help you{" "}
            <span>
              Compare
              <img src="/images/headerSmileVector.svg" alt=":)" />
            </span>
          </p>
          <p className={styles.desc}>
            Comparable finds the stuff you need all over the internet and brings
            up all the results for you to help you compare and get the best
            value.
          </p>
          <Button
            withArrow
            onClick={() =>
              whyRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore
          </Button>
        </div>
        <div className={styles.right}>
          <img src="/images/headerImage.png" alt="Comparable Image" />
        </div>
      </div>

      <div className={styles.why} ref={whyRef}>
        <p className={styles.title}>Why Comparable ?</p>

        <div className={styles.inner}>
          <div className={styles.left}>
            <img src="/images/whyComparableImage.png" alt="Why Comparable" />
          </div>
          <div className={styles.right}>
            <div className={styles.info}>
              <p className={styles.title}>We are not biased</p>
              <p className={styles.desc}>
                We fetch the results from all platforms without prioritizing any
                platform and give you exact same results.
              </p>
            </div>
            <div className={styles.info}>
              <p className={styles.title}>Fast as well as Accurate</p>
              <p className={styles.desc}>
                We try to provide you the results as fast as possible and have a
                user interaction time of minimum 1s to maximum 5s.
              </p>
            </div>
            <div className={styles.info}>
              <p className={styles.title}>Built as a Tool not a Company</p>
              <p className={styles.desc}>
                Comparable was actually built for personal use, as when we
                wanted something from Internet we tend to loose some good deals
                as {"it’s"}
                not possible to check every single platform everytime you buy
                things. So we decided to code things up and thus made{" "}
                <span>Comparable.</span> Now we are allowing people to use this
                fantastic tool by increasing and improving the features. We see
                comparable as a utility tool and it will be open for everyone as
                long as we can afford its running cost.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.offering}>
        <p className={styles.title}>What do we have ?</p>

        <div className={styles.inner}>
          <div className={`${styles.section}`}>
            <div className={styles.left}>
              <p className={styles.title}>Hotel Bookings comparison</p>
              <p className={styles.desc}>
                Compare prices of same Hotel on different platforms all at once
                with Comparable. Currently we include 4 platforms including
                Hotels and goibibo.
              </p>
              <Button withArrow onClick={() => router.push("/hotel")}>
                Checkout
              </Button>
            </div>
            <div className={styles.right}>
              <img src="/images/hotelBookingImage.png" alt="Hotel Image" />
            </div>
          </div>

          <div className={`${styles.section} ${styles.reverse}`}>
            <div className={styles.left}>
              <p className={styles.title}>E-commerce shopping comparison</p>
              <p className={styles.desc}>
                Get you favorite Electronics, fashion deals from 10 different
                platforms, all compared at once with Comparable. These platforms
                also includes amazon, flipkart, croma etc.
              </p>
              <Button withArrow onClick={() => router.push("/ecomerce")}>
                Checkout
              </Button>
            </div>
            <div className={styles.right}>
              <img src="/images/ecomerceShoppingImage.png" alt="Hotel Image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
