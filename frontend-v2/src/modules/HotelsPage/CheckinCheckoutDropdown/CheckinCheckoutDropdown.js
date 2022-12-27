import React from "react";
import { useSelector } from "react-redux";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";

import Dropdown from "components/Dropdown/Dropdown";

import styles from "./CheckinCheckoutDropdown.module.scss";

function CheckinCheckoutDropdown({
  onClose,
  onDateChange,
  checkinDate,
  checkoutDate,
  forCheckIn,
}) {
  const isMobileView = useSelector((state) => state.root.mobileView);

  const handleDayClick = (d) => {
    if (forCheckIn) {
      if (checkoutDate && onDateChange) onDateChange([d, checkoutDate]);
      else if (onDateChange) onDateChange([d, ""]);
    } else {
      if (checkinDate && onDateChange) onDateChange([checkinDate, d]);
      else if (onDateChange) onDateChange(["", d]);
    }
  };

  return (
    <Dropdown onClose={onClose} className={styles.container}>
      <p className={styles.heading}>
        Select {isMobileView ? "start and end date" : "date"}
      </p>

      <Calendar
        view="month"
        selectRange
        defaultValue={[checkinDate, checkoutDate]}
        defaultActiveStartDate={checkinDate}
        onClickDay={handleDayClick}
        className={styles.calendar}
        onChange={(valArr) => (onDateChange ? onDateChange(valArr) : "")}
        minDate={new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)}
        maxDate={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)}
      />
    </Dropdown>
  );
}

export default CheckinCheckoutDropdown;
