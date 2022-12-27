import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Slider from "rc-slider";

import Checkbox from "components/Checkbox/Checkbox";

import { filterValues, availableFilterOptions } from "constants";

import "rc-slider/assets/index.css";
import styles from "./Filters.module.scss";

function Filters(props) {
  const [filters, setFilters] = useState(props?.appliedFilters || {});
  const [selectedFilter, setSelectedFilter] = useState(`${availableFilterOptions.price}`);
  const [priceRange, setPriceRange] = useState(props?.appliedFilters?.price || [50, 100000]);
  const [isFilterModal, setIsFilterModal] = useState(false);
  const [isMaxLimit, setIsMaxLimit] = useState(false);


  let filterOptions = {};
  for(let i = 0; i < props.filterOption.length; ++i){
    filterOptions[props.filterOption[i]] = filterValues[props.filterOption[i]];
  }

  const filterMarks = {
    50: "50",
    10000: "10K",
    25000: "25K",
    50000: "50K",
    70000: "70K",
    100000: "100K",
  };

  const handlePriceFilter = (value) => {
    if(isMaxLimit){
      const dummyValue = [...value];
      dummyValue[1] = 1000000;
      setPriceRange(dummyValue);
      setFilters({...filters,price: dummyValue})
      return;
    }
    setPriceRange(value);
    setFilters({ ...filters, price: value });
  };

  const filtersHandler = (option, key) => {
    if (!option || !key) return;
    const dummyFilters = { ...filters };

    if (dummyFilters[key]) {
      const tempArr = dummyFilters[key];
      const index = tempArr.indexOf(option);
      if (index < 0) {
        tempArr.push(option);
      } else {
        tempArr.splice(index, 1);
      }
      setFilters(dummyFilters);
    } else {
      dummyFilters[key] = [option];
      setFilters(dummyFilters);
    }
  };

  const isOptionChecked = (optionValue, key) => {
    if (!optionValue || !key) return false;
    const tempArr = filters[key];
    if (!tempArr) return false;
    const index = tempArr?.indexOf(optionValue);
    if (index < 0) return false;
    return true;
  };

  const handleNoLimit = () => {
    if (priceRange[1] === 1000000) {
      setPriceRange([priceRange[0], 100000]);
    } else if (priceRange[1] <= 100000) setPriceRange([priceRange[0], 1000000]);
    setIsMaxLimit(!isMaxLimit)

  };

  return (
    <div className={styles.filter}>
      <div className={styles.header}>
        <p className={styles.title}>Filters</p>
        <p className={styles.clearFilter} onClick={() => {
          setFilters({});
          setPriceRange(filterValues.price);
          const gender = props?.appliedFilters.gender;
          props.applyFilter({gender});
        }}>
          Clear All
        </p>
      </div>
      <div className={styles.innerContainer}>
        <div className={styles.leftSide}>
          {Object.keys(filterOptions)?.map((option) => (
            <li
              key={option}
              className={selectedFilter === option ? styles.activeFilter : ""}
              onClick={() => setSelectedFilter(option)}
            >
              <p>{option} {filters && Object.keys(filters).some((item => item === option)) ? <span className={styles.active}></span> : ""}</p>
              
            </li>
          ))}
        </div>
        <div className={styles.rightSide}>
          {selectedFilter && selectedFilter === availableFilterOptions.price ? (
            <li className={styles.priceSlider}>
              <Slider
                range
                dots
                min={50}
                max={100000}
                step={50}
                marks={filterMarks}
                onChange={handlePriceFilter}
                value={priceRange}
                allowCross={false}
                activeDotStyle={{ borderColor: "rgb(37, 140, 244)" }}
                trackStyle={[{ backgroundColor: "rgb(37, 140, 244)" }]}
              />
              <div className={styles.showRange}>
                <p>
                  <b>Min:</b> {priceRange[0]}
                </p>
                {!isMaxLimit ? (
                  <p>
                    <b>Max:</b> {priceRange[1]}
                  </p>
                ) : (
                  ""
                )}
              </div>
              <Checkbox text={"No max limit"} value={isMaxLimit} enableTextClick onChange={() => handleNoLimit()}></Checkbox>
            </li>
          ) : selectedFilter &&
            selectedFilter !== availableFilterOptions.price ? (
            filterOptions[selectedFilter].map((optionValue) => (
              <li key={optionValue}>
                <Checkbox
                  default={isOptionChecked(optionValue, selectedFilter)}
                  text={optionValue}
                  enableTextClick
                  onChange={() => filtersHandler(optionValue, selectedFilter)}
                ></Checkbox>
              </li>
            ))
          ) : (
            ""
          )}
        </div>
      </div>
      <div className={styles.filterButtonContainer}>
        <div
          className={styles.button}
          onClick={() => {
            setIsFilterModal(false);
            props.close();
          }}
        >
          <p>close</p>
        </div>
        <div
          className={`${styles.button} ${styles.applyButton}`}
          onClick={() => {
            props.applyFilter(filters);
          }}
        >
          <p>Apply</p>
        </div>
      </div>
    </div>
  );
}

Filters.propTypes = {
  category: PropTypes.string,
  applyFilter: PropTypes.bool,
  close: PropTypes.func,
  applyFilter: PropTypes.func,
  filterOption: PropTypes.array,
  appliedFilters: PropTypes.object,
};

export default Filters;
