import React from "react";
import { X } from "react-feather";

import Modal from "components/Modal/Modal";

import styles from "./FeaturesModal.module.scss";

function FeaturesModal({ features = [], onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.heading}>Key Features</p>

          <div className="icon" onClick={() => (onClose ? onClose() : "")}>
            <X />
          </div>
        </div>

        <div className={styles.features}>
          {features.map((item, index) => (
            <div className={`${styles.feature}`} key={index}>
              <p>
                {index + 1}. {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default FeaturesModal;
