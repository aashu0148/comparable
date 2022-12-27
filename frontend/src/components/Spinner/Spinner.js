import React from "react";

import styles from "./Spinner.module.scss";

function Spinner(props) {
  // spinners taken from codepen - jon kantren
  const showSecondSpinner = props.second ? true : false;

  return showSecondSpinner ? (
    <div className={styles.spinner2Outer}>
      <div className={styles.spinner2}>
        <svg
          className={styles.pl}
          viewBox="0 0 128 128"
          width="128px"
          height="128px"
        >
          <defs>
            <linearGradient id="pl-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(193,90%,55%)" />
              <stop offset="100%" stopColor="hsl(223,90%,55%)" />
            </linearGradient>
          </defs>
          <circle
            className={styles.pl__ring}
            r="56"
            cx="64"
            cy="64"
            fill="none"
            stroke="hsla(0,10%,10%,0.1)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            className={styles.pl__worm}
            d="M92,15.492S78.194,4.967,66.743,16.887c-17.231,17.938-28.26,96.974-28.26,96.974L119.85,59.892l-99-31.588,57.528,89.832L97.8,19.349,13.636,88.51l89.012,16.015S81.908,38.332,66.1,22.337C50.114,6.156,36,15.492,36,15.492a56,56,0,1,0,56,0Z"
            fill="none"
            stroke="url(#pl-grad)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="44 1111"
            strokeDashoffset="10"
          />
        </svg>
      </div>
    </div>
  ) : (
    <div className={styles.spinner1Outer}>
      <div className={styles.spinner1}>
        <main>
          <svg
            className={styles.pl}
            viewBox="0 0 176 160"
            width="176px"
            height="160px"
          >
            <defs>
              {/* <linearGradient id="pl-grad-2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(33,90%,55%)" />
              <stop offset="30%" stopColor="hsl(33,90%,55%)" />
              <stop offset="100%" stopColor="hsl(3,90%,55%)" />
            </linearGradient> */}
              <linearGradient id="pl-grad-2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="30%" stopColor="hsl(199,90%,55%)" />
                <stop offset="0%" stopColor="hsl(193,90%,55%)" />
                <stop offset="100%" stopColor="hsl(223,90%,55%)" />
              </linearGradient>
            </defs>
            <g fill="none" strokeWidth="16" strokeLinecap="round">
              <circle
                className={styles.pl__ring}
                r="56"
                cx="88"
                cy="96"
                stroke="hsla(0,10%,10%,0.1)"
              />
              <path
                className={styles.pl__worm1}
                d="M144,96A56,56,0,0,1,32,96"
                stroke="url(#pl-grad-2)"
                strokeDasharray="43.98 307.87"
              />
              <path
                className={styles.pl__worm2}
                d="M32,136V96s-.275-25.725,14-40"
                stroke="rgb(37, 199, 244)"
                strokeDasharray="0 40 0 44"
                strokeDashoffset="0.001"
                visibility="hidden"
              />
              <path
                className={styles.pl__worm3}
                d="M144,136V96s.275-25.725-14-40"
                stroke="rgb(37, 199, 244)"
                strokeDasharray="0 40 0 44"
                strokeDashoffset="0.001"
                visibility="hidden"
              />
            </g>
          </svg>
        </main>
      </div>
    </div>
  );
}

export default Spinner;
