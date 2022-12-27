import React, { useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { Edit3, Home, Menu, ShoppingBag, X } from "react-feather";

import Backdrop from "components/Backdrop/Backdrop";

import styles from "./Navbar.module.scss";

function Navbar() {
  const router = useRouter();
  const pathname = router.pathname;
  const isMobileView = useSelector((state) => state.root.mobileView);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    {
      href: "/ecomerce",
      name: "E-commerce",
      icon: ShoppingBag,
    },
    {
      href: "/hotel",
      name: "Hotels",
      icon: Home,
    },
  ];

  return (
    <div className={styles.container}>
      {isMenuOpen && isMobileView ? (
        <Backdrop onClose={() => setIsMenuOpen(false)}>
          <div className={styles.drawer}>
            <div className={styles.icon}>
              <X onClick={() => setIsMenuOpen(false)} />
            </div>
            <div className={styles.list}>
              {navLinks.map((item) => (
                <Link href={item.href} key={item.name}>
                  <p
                    className={`${styles.link}  ${
                      pathname.includes(item.href) ? styles.active : ""
                    }`}
                  >
                    <item.icon />
                    {item.name}
                  </p>
                </Link>
              ))}

              <p className={styles.link}>
                <Edit3 />
                Feedback
              </p>
            </div>
          </div>
        </Backdrop>
      ) : (
        ""
      )}

      <Link href="/">
        <p className={styles.logo}>Comparable</p>
      </Link>

      {isMobileView ? (
        <div className={styles.links}>
          <div
            className={styles.icon}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </div>
        </div>
      ) : (
        <div className={styles.links}>
          {navLinks.map((item) => (
            <Link href={item.href} key={item.name}>
              <p
                className={`${styles.link} ${
                  pathname.includes(item.href) ? styles.active : ""
                }`}
              >
                {item.name}
              </p>
            </Link>
          ))}
          <p className={styles.link}>Feedback</p>
        </div>
      )}
    </div>
  );
}

export default Navbar;
