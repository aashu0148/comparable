import toast from "react-hot-toast";
import { Star } from "react-feather";
import cryptoJs from "crypto-js";
import uuid from "react-uuid";
import stringSimilarity from "string-similarity";

import { emailRegex, allScrappersList } from "constants.js";

export const validateEmail = (email) => {
  if (!email) return false;
  if (emailRegex.test(email.toLowerCase())) return true;
  else return false;
};

export const errorToastLogger = (error, message) => {
  if (error?.response?.message) {
    toast.error(error?.response?.message);
  } else {
    if (message) toast.error(message);
    else {
      const errorMessage = error?.message ? error.message : error + "";
      toast.error(errorMessage);
    }
  }
  console.error(error);
};

export const getEncryptedAuthorizationHeader = (text) => {
  console.log(text);
  return cryptoJs.AES.encrypt(
    JSON.stringify({
      text,
      id: uuid(),
      name: localStorage.getItem("userName"),
    }),
    process.env.REACT_APP_PRIVATE_KEY
  ).toString();
};

export const generateRatingStars = (value, className, filledClassName) => {
  if (!value) return "";
  const rating = parseFloat(value);
  if (!rating) return "";
  if (rating < 1) return "";
  const output = [];
  for (let i = 0, j = 0; i < 5; ++i, ++j) {
    if (j < rating)
      output.push(<Star className={`${className} ${filledClassName}`} />);
    else output.push(<Star className={`${className} `} />);
  }
  return (
    <div
      style={{
        display: "flex",
        gap: "1px",
        alignItems: "center",
      }}
    >
      {output}
    </div>
  );
};

export const numberToKConvertor = (num) => {
  return Math.abs(num) > 999
    ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + "K"
    : Math.sign(num) * Math.abs(num);
};

export const extractNumberFromStringWithLimit = (str) => {
  if (!str || str.length > 11) return 0;

  str = str + "";
  const num = parseFloat((str.match(/[0123456789.]/g) || []).join("")) || 0;
  return num;
};

export const extractNumberFromString = (str) => {
  if (!str) return 0;

  str = str + "";
  str = str.replace(/Rs./i, "");
  const num = parseFloat((str.match(/[0123456789.]/g) || []).join("")) || 0;
  return num;
};

export const extractIntegerFromString = (str) => {
  if (!str) return 0;

  str = str + "";
  const num = parseInt((str.match(/[0123456789]/g) || []).join("")) || 0;
  return num;
};

export const findRelevancyScore = (str, arr = []) => {
  if (!str || !arr.length || !Array.isArray(arr)) return [];
  const strArr = str.split(" ");

  const output = arr.map((item) => {
    if (!item) return 0;
    const tempScoreArr = strArr.map((strItem) => {
      const tempStr = strItem.toLowerCase();
      const tempItem = item.toLowerCase().split(" ").join("");
      if (tempItem.length < tempStr.length)
        return { str: tempStr, maxScore: 0 };

      let maxScore = 0,
        strLength = tempStr.length;
      for (let i = 0; i < tempItem.length + 1 - strLength; i++) {
        const slicedItem = tempItem.slice(i, strLength + i);
        const result = stringSimilarity.compareTwoStrings(tempStr, slicedItem);
        if (result > maxScore) maxScore = result;
      }
      return { str: tempStr, maxScore };
    });

    // conditionally reducing score of smaller strings(less than 3)
    for (let i = 0; i < tempScoreArr.length; ++i) {
      const item = tempScoreArr[i];
      if (item.str.length < 3) {
        if (i > 0 && tempScoreArr[i - 1].maxScore < 0.8)
          item.maxScore = 0.5 * item.maxScore;
      }
    }

    const scoreArr = tempScoreArr.map((item) => item.maxScore);
    const finalScore =
      scoreArr.reduce((prev, curr) => prev + curr, 0) / scoreArr.length;
    return finalScore;
  });

  return output.map((item) => parseFloat(item.toFixed(2)));
};

export const readOffersAndReturnMax = (offers = [], price, from) => {
  if (!offers.length || !price || !from) return {};

  let maxOffer = 0,
    maxOfferIndex = -1;

  offers.forEach((item, index) => {
    const offer = item.split(" ").join("").toLowerCase();
    let discount = 0;

    switch (from) {
      case allScrappersList.amazon: {
        // Flat INR 1000 Instant Discount on ICICI Bank Credit Cards (excluding Amazon Pay ICICI Credit Card) Credit Card Transactions. Minimum purchase value INR 5000
        // 10% Instant Discount up to INR 750 on Citi Bank Credit Card Transactions. Minimum purchase value INR 5000
        const minimumPurchaseValueIndex = offer.indexOf(
          "minimumpurchasevalueinr"
        );
        const minimumPurchase = extractNumberFromString(
          offer.slice(
            minimumPurchaseValueIndex + 22,
            minimumPurchaseValueIndex + 30
          )
        );

        const flatDiscount = extractNumberFromString(
          offer.slice(
            offer.indexOf("flatinr") + 7,
            offer.indexOf("flatinr") + 14
          )
        );

        if (flatDiscount && price > minimumPurchase) {
          discount = flatDiscount;
          break;
        }

        const instantDiscountIndex = offer.indexOf("instantdiscountuptoinr");
        const percentDiscount = extractNumberFromString(
          offer.slice(0, instantDiscountIndex)
        );
        const maxPercentDiscount =
          instantDiscountIndex > -1
            ? extractNumberFromString(
                offer.slice(
                  instantDiscountIndex + 21,
                  instantDiscountIndex + 29
                )
              )
            : 99999;
        if (percentDiscount && price > minimumPurchase) {
          const percentDiscountValue = (percentDiscount / 100) * price;
          if (percentDiscountValue > maxPercentDiscount)
            discount = maxPercentDiscount;
          else discount = percentDiscountValue;
        }
        break;
      }
      case allScrappersList.flipkart: {
        // Bank Offer: 10% off on Kotak Bank Credit Cards, up to ₹1,000. On orders of ₹3,000 and above
        // Bank Offer: 5% off on Flipkart Axis Bank Co Brand Card, up to ₹625. On orders of ₹3000 and above
        // Bank Offer: ₹282 Instant Discount on Flipkart Axis Bank Credit Card Transactions
        const minimumPurchaseValueIndex = offer.indexOf("onordersof");
        const minimumPurchase =
          minimumPurchaseValueIndex > -1
            ? extractNumberFromString(
                offer.slice(
                  minimumPurchaseValueIndex + 10,
                  minimumPurchaseValueIndex + 18
                )
              )
            : 0;
        const instantDiscountIndex = offer.indexOf("instantdiscount");
        const instantDiscount =
          instantDiscountIndex > -1
            ? extractNumberFromString(
                offer.slice(instantDiscountIndex - 6, instantDiscountIndex)
              )
            : 0;

        if (instantDiscount && price > minimumPurchase) {
          discount = instantDiscount;
          break;
        }

        const percentDiscount =
          offer.indexOf("%offon") > -1
            ? extractNumberFromString(offer.slice(0, offer.indexOf("%offon")))
            : 0;
        const maxPercentDiscount =
          offer.indexOf("upto") > -1
            ? extractNumberFromString(
                offer.slice(
                  offer.indexOf("upto") + 4,
                  offer.indexOf("upto") + 11
                )
              )
            : 99999;
        if (percentDiscount && price > minimumPurchase) {
          const percentDiscountValue = (percentDiscount / 100) * price;
          if (percentDiscountValue > maxPercentDiscount)
            discount = maxPercentDiscount;
          else discount = percentDiscountValue;
          break;
        }
        const cashback = extractNumberFromString(
          0,
          offer.indexOf("%cashbackon")
        );
        if (cashback && price > minimumPurchase) {
          if (cashback > maxPercentDiscount && maxPercentDiscount)
            discount = maxPercentDiscount;
          else discount = cashback;
          break;
        }

        break;
      }
      case allScrappersList.croma: {
        // 10% Instant discount upto Rs.1000 on HDFC Bank Credit & Debit Card. Select the offer from “View all offers ”on payment page T&C Apply.
        // 7.5% cashback upto Rs. 2,500 on Credit card EMI for cart value above Rs. 10,000 on CITI Bank Card. Select the offer from “View all offers ”on payment page T&C Apply. Applicable on www.croma.com, coming soon on Tata Neu App.
        // Flat 7.5% Instant discount on HDFC Bank Credit & Debit Card. Select the offer from “View all offers ”on payment page T&C Apply.
        // Get 5% off upto Rs.500 on Croma.com , use your coupon code to avail the offer (not applicable on Mobile Phones & Select brands)
        const minimumPurchaseValueIndex = offer.indexOf("cartvalueabove");
        const minimumPurchase =
          minimumPurchaseValueIndex > -1
            ? extractNumberFromString(
                offer.slice(
                  minimumPurchaseValueIndex + 14,
                  minimumPurchaseValueIndex + 25
                )
              )
            : 0;

        const percentDiscount = offer.slice(0, 10).includes("%")
          ? extractNumberFromStringWithLimit(offer.slice(0, 10))
          : 0;
        const maxPercentDiscount =
          offer.indexOf("upto") > -1
            ? extractNumberFromString(
                offer.slice(
                  offer.indexOf("upto") + 7,
                  offer.indexOf("upto") + 14
                )
              )
            : 99999;

        if (percentDiscount && price > minimumPurchase) {
          const percentDiscountValue = (percentDiscount / 100) * price;
          if (percentDiscountValue > maxPercentDiscount)
            discount = maxPercentDiscount;
          else discount = percentDiscountValue;
          break;
        }
        break;
      }
      case allScrappersList.reliance: {
        // Up to 7.5% Instant Discount(Max Rs.7500) with ICICI Bank Cards
        // 10% Cashback with ZestMoney EMI
        // Flat 1500 Cashback on IndusInd Bank Credit EMI transactions.
        // HDFC BANK Offer: Get Rs.4000 Bank Cashback on CC ( EMI & Full Swipe ) & DC EMI. 6 Months No Cost EMI also available. T&C apply

        const instantDiscountIndex = offer.indexOf("cashbackon");
        const instantDiscount =
          instantDiscountIndex > -1
            ? extractIntegerFromString(offer.slice(0, instantDiscountIndex))
            : 0;

        if (instantDiscount) {
          discount = instantDiscount;
          break;
        }

        const percentDiscount = offer.slice(0, 10).includes("%")
          ? extractNumberFromStringWithLimit(offer.slice(0, 10))
          : 0;
        const uptoIndex = offer.indexOf("upto");
        const maxIndex = offer.indexOf("maxrs");
        const maxPercentDiscount =
          maxIndex > -1
            ? extractIntegerFromString(offer.slice(maxIndex + 5, maxIndex + 11))
            : uptoIndex > -1
            ? extractIntegerFromString(
                offer.slice(uptoIndex + 6, uptoIndex + 12)
              )
            : 99999;
        if (percentDiscount) {
          const percentDiscountValue = (percentDiscount / 100) * price;
          if (percentDiscountValue > maxPercentDiscount)
            discount = maxPercentDiscount;
          else discount = percentDiscountValue;
          break;
        }

        break;
      }
      // case allScrappersList.tatacliq: {
      //   break;
      // }
    }

    if (discount && parseInt(discount) > price) return {};
    if (discount && discount > maxOffer) {
      maxOfferIndex = index;
      maxOffer = parseInt(discount);
    }
  });

  return {
    discount: maxOffer,
    offerIndex: maxOfferIndex > -1 ? maxOfferIndex : "",
  };
};
