import React, { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "react-feather";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

import Spinner from "components/Spinner/Spinner";

import { getAnalytics } from "api/analytics";
import { colors } from "constants.js";

import styles from "./Analytics.module.scss";

function Analytics() {
  const [lastTwoDaysAnalytics, setLastTwoDaysAnalytics] = useState([]);
  const [allAnalytics, setAllAnalytics] = useState([]);
  const [isAnalyticsLeaded, setIsAnalyticsLoaded] = useState(false);

  const getTotalAllCounts = (analytic) => {
    if (!analytic || !analytic?.apiCallCount) return "";
    const calls = Object.values(analytic.apiCallCount);
    return calls.reduce((acc, curr) => acc + parseInt(curr.totalCount || 0), 0);
  };

  const getTopUser = (users) => {
    if (!users || !Array.isArray(users)) return {};
    let topUserIndex = -1,
      maxReq = 0;
    users.forEach((item, index) => {
      if (item.count > maxReq) {
        maxReq = item.count;
        topUserIndex = index;
      }
    });
    if (topUserIndex == -1) return {};
    return users[topUserIndex];
  };

  const lastTwoDaysCountComparison = (item) => {
    return compareNumbers(
      lastTwoDaysAnalytics[0].apiCallCount[item]?.totalCount,
      lastTwoDaysAnalytics[1].apiCallCount[item]?.totalCount
    );
  };

  const compareNumbers = (num1, num2) => {
    if (isNaN(num1) || isNaN(num2)) return "";
    if (num1 == num2) return 0;

    const percent = (num1 / num2) * 100;
    return Math.round(-1 * (100 - percent));
  };

  const getFormattedDate = (value) => {
    if (!value) return "";
    const todayDate = new Date();
    const date = new Date(value);
    const currDate = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    if (todayDate.getMonth() + 1 == month && todayDate.getFullYear() == year) {
      if (todayDate.getDate() == currDate) return "Today";
      else if (todayDate.getDate() - 1 == currDate) return "Yesterday";
    }

    return `${currDate}-${month}-${year}`;
  };

  const getChartDataFromAnalytics = () => {
    if (allAnalytics.length == 0) return {};
    const myAnalytics = [...allAnalytics];
    myAnalytics.reverse();
    const generalAnalyticsCounts = [];
    const fashionAnalyticsCounts = [];
    const electronicsAnalyticsCounts = [];
    const customAnalyticsCounts = [];
    const labels = [];

    let generalCount = 0,
      fashionCount = 0,
      electronicsCount = 0,
      customCount = 0;
    myAnalytics.forEach((item, index) => {
      const createdAt = new Date(item.createdAt);
      const general = item?.apiCallCount?.general;
      const fashion = item?.apiCallCount?.fashion;
      const electronics = item?.apiCallCount?.electronics;
      const custom = item?.apiCallCount?.custom;
      generalCount += parseInt(general.totalCount || 0);
      fashionCount += parseInt(fashion.totalCount || 0);
      electronicsCount += parseInt(electronics.totalCount || 0);
      customCount += parseInt(custom.totalCount || 0);

      const modFour = (index + 1) % 4;
      if (modFour == 0) {
        labels.push(`${createdAt.getDate()}/${createdAt.getMonth() + 1}`);
        generalAnalyticsCounts.push(generalCount);
        electronicsAnalyticsCounts.push(electronicsCount);
        fashionAnalyticsCounts.push(fashionCount);
        customAnalyticsCounts.push(customCount);
        generalCount = 0;
        fashionCount = 0;
        customCount = 0;
        electronicsCount = 0;
      }
    });

    return {
      labels,
      generalAnalyticsCounts,
      fashionAnalyticsCounts,
      electronicsAnalyticsCounts,
      customAnalyticsCounts,
    };
  };

  const fetchAnalytics = () => {
    getAnalytics().then((res) => {
      setIsAnalyticsLoaded(true);
      if (!res) return;
      const data = res.data;
      if (!data) return;

      setLastTwoDaysAnalytics([data[0], data[1]]);
      setAllAnalytics(data);
    });
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Requests in last 2 months",
      },
    },
  };
  const chartData = getChartDataFromAnalytics();

  return isAnalyticsLeaded ? (
    <div className={styles.container}>
      {lastTwoDaysAnalytics.length > 0 ? (
        <>
          <div className={styles.top}>
            <p className={styles.title}>
              {getFormattedDate(lastTwoDaysAnalytics[0].createdAt)} requests (
              {getTotalAllCounts(lastTwoDaysAnalytics[0])})
            </p>
            <div className={styles.cards}>
              {Object.keys(lastTwoDaysAnalytics[0].apiCallCount).map((item) => (
                <div key={item} className={`${styles.card} ${styles[item]}`}>
                  <p className={styles.category}>{item}</p>
                  <p className={styles.req}>
                    {lastTwoDaysAnalytics[0].apiCallCount[item]?.totalCount}
                  </p>
                  <p className={styles.user}>
                    Top user -{" "}
                    <span>
                      {getTopUser(
                        lastTwoDaysAnalytics[0].apiCallCount[item].users
                      )?.name || "__"}
                    </span>
                  </p>
                  <p className={styles.comparison}>
                    <span
                      className={
                        lastTwoDaysCountComparison(item) > 0 ? "" : styles.red
                      }
                    >
                      {lastTwoDaysCountComparison(item) > 0 ? (
                        <TrendingUp />
                      ) : (
                        <TrendingDown />
                      )}
                      {Math.abs(lastTwoDaysCountComparison(item))}%
                    </span>
                    from {getFormattedDate(lastTwoDaysAnalytics[1].createdAt)}
                    {"  "}(
                    {lastTwoDaysAnalytics[1].apiCallCount[item].totalCount})
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.body}>
            <div style={{ maxWidth: "600px", minHeight: "300px" }}>
              <Line
                options={chartOptions}
                data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      label: "General",
                      data: chartData.generalAnalyticsCounts,
                      backgroundColor: colors.orange,
                      borderColor: colors.orange,
                    },
                    {
                      label: "Fashion",
                      data: chartData.fashionAnalyticsCounts,
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                    {
                      label: "Electronics",
                      data: chartData.electronicsAnalyticsCounts,
                      backgroundColor: colors.darkGreen,
                      borderColor: colors.darkGreen,
                    },
                    {
                      label: "Custom",
                      data: chartData.customAnalyticsCounts,
                      backgroundColor: colors.yellow,
                      borderColor: colors.yellow,
                    },
                  ],
                }}
              />
            </div>
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  ) : (
    <div className={styles.spinner}>
      <Spinner />
    </div>
  );
}

export default Analytics;
