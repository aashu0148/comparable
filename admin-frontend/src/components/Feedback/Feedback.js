import React, { useEffect } from "react";
import DataTable from "react-data-table-component";

import styles from "./Feedback.module.scss";

function Feedback() {
  const columns = [
    {
      name: "Title",
      selector: (row) => row.title,
    },
    {
      name: "Year",
      selector: (row) => row.year,
    },
  ];

  const data = [
    {
      id: 1,
      title: "Beetlejuice",
      year: "1988",
    },
    {
      id: 2,
      title: "Ghostbusters",
      year: "1984",
    },
  ];

  useEffect(() => {
    fetch(
      `https://www.myntra.com/gateway/v2/search/men?f=Categories%3AShirts&o=50&ifo=0&ifc=3&rows=50&requestType=ANY&priceBuckets=20`
    )
      .then(async (res) => {
        const data = await res.json();
        console.log(data);
      })
      .catch((err) => console.log(err.message));
  }, []);

  return (
    <div className={styles.container}>
      <p className={styles.heading}>Feedbacks</p>

      <DataTable title="Feedbacks" columns={columns} data={data} />
    </div>
  );
}

export default Feedback;
