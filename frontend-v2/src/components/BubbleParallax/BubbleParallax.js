import React, { useEffect, useRef } from "react";
import { generateRandomNumBetween } from "utils/util";

import styles from "./BubbleParallax.module.scss";

let interval;
function BubbleParallax({
  bubbles = [
    { top: 0, left: 0, size: 150 },
    { top: 0, left: 0, size: 100 },
    { top: 0, left: 0, size: 140 },
  ],
}) {
  const containerRef = useRef();
  const calculateDistanceBetweenPoints = (x1 = 1, y1 = 1, x2 = 1, y2 = 1) => {
    const m1 = x2 - x1;
    const m2 = y2 - y1;

    return Math.sqrt(m1 * m1 + m2 * m2);
  };

  const computeBubbles = (bubbles, container) => {
    const isMobileView = window.screen.width < 768;
    const containerAllDimension = container.getBoundingClientRect();
    const speed = 90;
    const containerDimensions = {
      top: Math.round(containerAllDimension.top),
      left: Math.round(containerAllDimension.left),
      right: Math.round(containerAllDimension.right),
      bottom: Math.round(containerAllDimension.bottom),
    };

    bubbles.forEach((bbl) => {
      const bubbleAllDimension = bbl.getBoundingClientRect();

      const bubbleDimensions = {
        top: Math.round(bubbleAllDimension.top),
        topCss: parseInt(bbl.style.top),
        leftCss: parseInt(bbl.style.left),
        width: bubbleAllDimension.width,
        left: Math.round(bubbleAllDimension.left),
        right: Math.round(bubbleAllDimension.right),
        bottom: Math.round(bubbleAllDimension.bottom),
        size: Math.round(bubbleAllDimension.width),
      };
      const computedTop = bubbleDimensions.top - containerDimensions.top;
      const computedLeft = bubbleDimensions.left - containerDimensions.left;
      // if computedTop is equals to css's top then it means the bubble is not moving vertically, similar for left
      // below if condition is to check if the bubble is stopped moving or gone out fo bounds
      if (
        bubbleDimensions.left <= containerDimensions.left ||
        bubbleDimensions.right >= containerDimensions.right ||
        bubbleDimensions.bottom >= containerDimensions.bottom ||
        bubbleDimensions.top <= containerDimensions.top ||
        (computedTop == bubbleDimensions.topCss &&
          computedLeft == bubbleDimensions.leftCss)
      ) {
        const newX = generateRandomNumBetween(
          containerDimensions.left,
          (containerDimensions.right - bubbleDimensions.size) /
            (isMobileView ? 1 : 2)
        );
        let newY = generateRandomNumBetween(
          containerDimensions.top,
          containerDimensions.bottom - bubbleDimensions.size
        );
        if (newY < 0) newY = 0;

        const distance = calculateDistanceBetweenPoints(
          bubbleDimensions.left,
          bubbleDimensions.top,
          newX,
          newY
        );
        const time = distance / speed;

        bbl.style.top = `${newY}px`;
        bbl.style.left = `${newX}px`;
        bbl.style.right = `auto`;
        bbl.style.bottom = `auto`;
        bbl.style.transition = `${time.toFixed(2)}s linear`;
      }
    });
  };

  useEffect(() => {
    const bubbles = document.querySelectorAll(".bubble-parallax");
    const container = containerRef.current;
    computeBubbles(bubbles, container);
    interval = setInterval(() => computeBubbles(bubbles, container), 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      {bubbles.map((item, index) => (
        <div
          key={index}
          className={`${styles.bubble} bubble-parallax`}
          style={{
            "--width": item.size ? `${item.size - 0.1 * item.size}px` : "180px",
            "--height": item.size
              ? `${item.size - 0.1 * item.size}px`
              : "180px",
            "--left": item.size ? `${0.05 * item.size}px` : "10px",
            height: item.size ? `${item.size}px` : "200px",
            width: item.size ? `${item.size}px` : "200px",
          }}
        />
      ))}
    </div>
  );
}

export default BubbleParallax;
