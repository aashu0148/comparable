const mongoose = require("mongoose");
const stringSimilarity = require("string-similarity");

const getClosingPairIndex = (str, startIndex = 0) => {
  if (!str) return;
  if (str[startIndex] != "{") return -1;

  const arr = [];
  const strLength = str.length;
  for (let i = startIndex; i < strLength; ++i) {
    if (str[i] == "{") arr.push(str[i]);
    else if (str[i] == "}") arr.pop();

    if (arr.length === 0) return i;
  }
  return -1;
};

const getDayMonthYearDate = (value) => {
  let date;
  if (value) date = new Date(value);
  else date = new Date();

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

function initaliseDb() {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
    })
    .then(() => {
      console.log("Established Mongoose Default Connection");
    })
    .catch((err) => {
      console.error("Mongoose Default Connection Error : " + err);
    });
}

module.exports = {
  getClosingPairIndex,
  getDayMonthYearDate,
  initaliseDb,
};
