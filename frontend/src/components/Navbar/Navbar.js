import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Mail, Moon, Sun, User } from "react-feather";
import toast from "react-hot-toast";

import { sendFeedback } from "api/search/search";
import { validateEmail } from "util";

import Modal from "components/Modal/Modal";
import Dropdown from "components/Dropdown/Dropdown";
import InputControl from "components/InputControl/InputControl";
import Button from "components/Button/Button";

import logo from "assets/logos/logo1.png";
import { themeColors } from "constants.js";

import styles from "./Navbar.module.scss";

function Navbar(props) {
  const { isConnectedToSocket, isConnectingToSocket } = props;
  const connectionId = props?.connectionId;
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );
  const [isNameModalOpen, setIsNameModalOpen] = useState(
    userName ? false : true
  );
  const [inputValue, setInputValue] = useState(userName ? userName : "");
  const [errrorMsg, setErrorMsg] = useState("");
  const [isFeedbackModal, setIsFeedbackModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [suggestionText, setSuggestionText] = useState("");
  const [priority, setPriority] = useState("");
  const [feedbackErrors, setFeedbackErrors] = useState({});
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(
    localStorage.getItem("isDarkTheme") == "true" ? true : false
  );

  const generateInitials = (name = "") => {
    if (!name) return "";

    const arr = name.split(" ");
    if (arr.length > 1) return `${arr[0].charAt(0)} ${arr[1].charAt(0)}`;
    else return arr[0].charAt(0);
  };

  const saveName = () => {
    if (!inputValue) {
      setErrorMsg("Field can't be empty");
      return;
    }
    if (props.setName) props.setName(inputValue);
    localStorage.setItem("userName", inputValue);
    setUserName(inputValue);
    setIsNameModalOpen(false);
    setErrorMsg("");
  };

  const handleFeedback = async () => {
    if (!emailInput) {
      setFeedbackErrors({ email: "Field can't be empty" });
      return;
    } else if (!validateEmail(emailInput)) {
      setFeedbackErrors({ email: "Enter valid email" });
      return;
    } else if (!suggestionText || !suggestionText.trim()) {
      setFeedbackErrors({ suggestion: "Field can't be empty" });
      return;
    } else if (priority === "") {
      setFeedbackErrors({ priority: "Select one of given options" });
      return;
    }
    setFeedbackErrors({});

    const res = await sendFeedback(
      emailInput,
      suggestionText,
      priority,
      connectionId
    );
    if (!res) return;
    toast.success("Feedback sent");
    setIsFeedbackModal(false);
  };

  const handleThemeChange = () => {
    const root = document.documentElement;

    Object.keys(themeColors.light).forEach((item) => {
      root.style.setProperty(
        `--${item}`,
        isDarkTheme ? themeColors.light[item] : themeColors.dark[item]
      );
    });

    localStorage.setItem("isDarkTheme", !isDarkTheme);
    setIsDarkTheme((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      {isNameModalOpen ? (
        <Modal
          className={styles.enterNameModal}
          onClose={() => (userName ? setIsNameModalOpen(false) : "")}
        >
          <div className={styles.modalChild}>
            <p>Please enter your name to proceed on Comparable</p>
            <InputControl
              // autoFocus
              placeholder="Enter your name"
              maxLength={40}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              error={errrorMsg ? errrorMsg : ""}
            />
            <div className={styles.buttonContainer}>
              <Button
                onClick={() => {
                  saveName();
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </Modal>
      ) : (
        ""
      )}
      <Link to="/">
        <div className={`${styles.link} ${styles.logo}`}>
          <div className={styles.logoInner}>
            <img src={logo} alt="Comparable" />
            <p>omparable</p>
          </div>
          <span
            className={`${styles.status} ${
              isConnectingToSocket
                ? window.navigator.onLine
                  ? styles.connecting
                  : styles.broken
                : isConnectedToSocket
                ? styles.active
                : styles.broken
            }`}
          />{" "}
        </div>
      </Link>
      <div className={styles.rightSide}>
        <div className={styles.theme} onClick={handleThemeChange}>
          {isDarkTheme ? <Moon /> : <Sun />}
        </div>
        <p
          className={styles.feedbackIcon}
          onClick={() => setIsFeedbackModal(true)}
        >
          <Mail /> Feedback
        </p>
        <div
          className={`${styles.link} ${styles.profile}`}
          onClick={() => setIsProfileDropdown(true)}
        >
          <p className={styles.initials}>{generateInitials(userName)}</p>
          {isProfileDropdown ? (
            <Dropdown
              startFromRight
              className={styles.profileDropdown}
              onClose={() => setIsProfileDropdown(false)}
            >
              <li
                onClick={() => {
                  setIsNameModalOpen(true);
                  setIsProfileDropdown(false);
                }}
              >
                <User /> Change Name
              </li>
              <li
                onClick={() => {
                  setIsFeedbackModal(true);
                  setIsProfileDropdown(false);
                }}
              >
                <Mail /> Feedback
              </li>
              <li onClick={handleThemeChange}>
                {!isDarkTheme ? (
                  <>
                    <Moon /> Dark
                  </>
                ) : (
                  <>
                    <Sun /> Light
                  </>
                )}
                Theme
              </li>
            </Dropdown>
          ) : (
            ""
          )}
        </div>
      </div>

      {isFeedbackModal ? (
        <Modal
          className={styles.feedBackModal}
          title="Your feedback is important to us"
          onClose={() => {
            setIsFeedbackModal(false);
            setFeedbackErrors({});
            setEmailInput("");
            setPriority("");
            setSuggestionText("");
          }}
        >
          <div className={styles.mainContainer}>
            {/* <p className={styles.title}>Your Feedback is Important to us</p> */}
            <form
              className={styles.feedbackForm}
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              <div className={styles.emailSection}>
                <p className={styles.emailLabel}>Please Enter your email</p>
                <InputControl
                  placeholder="Enter your email"
                  type="email"
                  className={styles.emailInput}
                  error={
                    feedbackErrors?.email !== "" ? feedbackErrors.email : ""
                  }
                  onChange={(event) => setEmailInput(event.target.value)}
                ></InputControl>
              </div>
              <div className={styles.suggestionBox}>
                <p>Enter your Feedback</p>
                <textarea
                  className={styles.suggetionInput}
                  onChange={(event) => setSuggestionText(event.target.value)}
                  placeholder="a) Write if you saw a bug.
b) Write if you want to add other platforms for comparison in the app
c) Or Do want to convey something to us ?
Just write it here we will surely listen to you"
                ></textarea>
                <p className={styles.error}>
                  {feedbackErrors?.suggestion !== ""
                    ? feedbackErrors.suggestion
                    : ""}
                </p>
              </div>
              <div className={styles.prioritySection}>
                <p>How critical it is?</p>
                <div className={styles.optionContainer}>
                  <div
                    onClick={() => setPriority("2")}
                    className={`${styles.priorityOption} ${
                      styles.unactiveHigh
                    } ${priority === "2" ? styles.high : ""}`}
                  >
                    <p>High</p>
                  </div>
                  <div
                    onClick={() => setPriority("1")}
                    className={`${styles.priorityOption} ${
                      styles.unactiveMedium
                    } ${priority === "1" ? styles.medium : ""}`}
                  >
                    <p>Medium</p>
                  </div>
                  <div
                    onClick={() => setPriority("0")}
                    className={`${styles.priorityOption} ${
                      styles.unactiveLow
                    } ${priority === "0" ? styles.low : ""}`}
                  >
                    <p>Low</p>
                  </div>
                </div>
                <p className={styles.error}>
                  {feedbackErrors?.priority !== ""
                    ? feedbackErrors.priority
                    : ""}
                </p>
              </div>

              <div className={styles.buttonContainer}>
                <Button
                  delete
                  onClick={() => {
                    setIsFeedbackModal(false);
                    setFeedbackErrors({});
                    setEmailInput("");
                    setPriority("");
                    setSuggestionText("");
                  }}
                >
                  Close
                </Button>
                <Button onClick={() => handleFeedback()}>Submit</Button>
              </div>
            </form>
          </div>
        </Modal>
      ) : (
        ""
      )}
    </div>
  );
}

Navbar.propTypes = {
  isConnectedToSocket: PropTypes.bool,
  isConnectingToSocket: PropTypes.bool,
  connectionId: PropTypes.string,
  setName: PropTypes.func,
};

export default Navbar;
