import React, { useState } from "react";
import { Minus, Plus } from "react-feather";

import Dropdown from "components/Dropdown/Dropdown";

import styles from "./RoomsDropdown.module.scss";

function RoomsDropdown({ onClose, data = {} }) {
  const ageArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const [roomsData, setRoomsData] = useState({
    rooms: data.rooms || 1,
    adults: data.adults || 1,
    children: data.children || [],
  });

  const handleClose = async () => {
    let data;

    await setRoomsData((prev) => {
      data = prev;
      return prev;
    });
    if (onClose) onClose(data);
  };

  const handleRoomChange = (increment = false) => {
    const rooms = parseInt(roomsData.rooms);

    if (increment && rooms < 6) rooms += 1;
    if (!increment && rooms > 1) rooms -= 1;

    setRoomsData((prev) => ({ ...prev, rooms }));
  };

  const handleAdultChange = (increment = false) => {
    const adults = parseInt(roomsData.adults);

    if (increment && adults < 6) adults += 1;
    if (!increment && adults > 1) adults -= 1;

    setRoomsData((prev) => ({ ...prev, adults }));
  };

  const handleChildrenChange = (increment = false) => {
    const children = [...roomsData.children];

    if (increment && children.length < 4) children.push(6);
    if (!increment && children.length > 0) children.pop();

    setRoomsData((prev) => ({ ...prev, children }));
  };

  const handleAgeChange = (ageIndex, newAge) => {
    const tempChildren = [...roomsData.children];

    tempChildren[ageIndex] = newAge;
    setRoomsData((prev) => ({ ...prev, children: tempChildren }));
  };

  return (
    <Dropdown onClose={handleClose} className={styles.container}>
      <p className={styles.heading}>Choose Rooms</p>

      <div className={styles.list}>
        <div className={styles.item}>
          <p className={styles.title}>
            Rooms <span>(Max 6)</span>
          </p>

          <div className={styles.button}>
            <div className={styles.icon} onClick={() => handleRoomChange()}>
              <Minus />
            </div>
            <p>{roomsData.rooms}</p>
            <div className={styles.icon} onClick={() => handleRoomChange(true)}>
              <Plus />
            </div>
          </div>
        </div>

        <div className={styles.item}>
          <p className={styles.title}>
            Adults <span>(12+ yr)</span>
          </p>

          <div className={styles.button}>
            <div className={styles.icon} onClick={() => handleAdultChange()}>
              <Minus />
            </div>
            <p>{roomsData.adults}</p>
            <div
              className={styles.icon}
              onClick={() => handleAdultChange(true)}
            >
              <Plus />
            </div>
          </div>
        </div>

        <div className={styles.item}>
          <p className={styles.title}>Children</p>

          <div className={styles.button}>
            <div className={styles.icon} onClick={() => handleChildrenChange()}>
              <Minus />
            </div>
            <p>{roomsData.children?.length}</p>
            <div
              className={styles.icon}
              onClick={() => handleChildrenChange(true)}
            >
              <Plus />
            </div>
          </div>
        </div>

        {roomsData.children?.length > 0
          ? roomsData.children.map((item, index) => (
              <div className={styles.select} key={index + "" + item}>
                <p className={styles.title}>
                  Child {index + 1}
                  {"'s"} age
                </p>

                <div className={styles.agesContainer}>
                  <div className={styles.ages}>
                    {ageArr.map((age, i) => (
                      <p
                        onClick={() => handleAgeChange(index, age)}
                        className={`${styles.age} ${
                          item == i + 1 ? styles.active : ""
                        }`}
                        key={age + "" + item + index}
                      >
                        {age}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ))
          : ""}
      </div>
    </Dropdown>
  );
}

export default RoomsDropdown;
