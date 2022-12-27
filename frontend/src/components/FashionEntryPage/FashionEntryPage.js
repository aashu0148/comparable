import React, { useState } from "react";
import { Link } from "react-router-dom";

import Button from "components/Button/Button";

import maleAvatar from "assets/genderImages/menFashion.jpg";
import femaleAvatar from "assets/genderImages/womenFashion.jpg";

import { availableCategories } from "constants";

import styles from "./FashionEntryPage.module.scss";

function FashionEntryPage() {
  const [gender, setGender] = useState([]);
  const [appliedFashionFilters, setAppliedFashionFilters] = useState(
    JSON.parse(sessionStorage.getItem("fashionfilters")) || ""
  );

  const applyGenderFilter = (value) => {
    if (!value) return;
    setGender([value]);
    const dummyFilters = { ...appliedFashionFilters, gender: [value] };
    sessionStorage.setItem("fashionfilters", JSON.stringify(dummyFilters));
  };

  return (
    <>
      <p className={styles.header}>Select gender</p>
      <div className={styles.mainContainer}>
        <div className={styles.genderSelectionContainer}>
          <Link
            to={`/search/${availableCategories.fashion}`}
            onClick={() => applyGenderFilter("men")}
          >
            <div className={styles.genderCard}>
              <div className={styles.imageBox}>
                <img src={maleAvatar} alt="men" />
              </div>
              <p>Men</p>
            </div>
          </Link>
          <Link
            to={`/search/${availableCategories.fashion}`}
            onClick={() => applyGenderFilter("women")}
          >
            <div className={styles.genderCard}>
              <div className={styles.imageBox}>
                <img src={femaleAvatar} alt="women" />
              </div>
              <p>Women</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

export default FashionEntryPage;
