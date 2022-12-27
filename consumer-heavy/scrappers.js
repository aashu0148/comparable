const axios = require("axios");
const { parse } = require("node-html-parser");

const { getClosingPairIndex } = require("./util.js");

const flipkartProductOfferScrapper = async (link) => {
  if (!link) return {};
  try {
    const response = await axios.get(link).catch((err) => void err);
    const text = response?.data;

    const slicedText = text.slice(text.indexOf(`pageDataV4`));
    const slicedText2 = slicedText.slice(
      slicedText.indexOf(`{`),
      slicedText.indexOf("</script")
    );
    const lastPairIndex = getClosingPairIndex(slicedText2);
    const slicedText3 = slicedText2.slice(0, lastPairIndex + 1);

    const parseData = JSON.parse(slicedText3);
    const offersSummaries = [];
    if (Array.isArray(parseData?.page?.data["10002"]))
      parseData?.page?.data["10002"]?.forEach((item) => {
        const groups = item?.widget?.data?.offerGroups;

        if (Array.isArray(groups)) {
          groups.forEach((elem) => {
            if (Array.isArray(elem?.renderableComponents))
              offersSummaries.push(...elem.renderableComponents);
          });
        }
      });

    const offers =
      offersSummaries?.map(
        (item) =>
          `${
            Array.isArray(item?.value?.tags)
              ? item?.value.tags[0]
                ? item?.value.tags[0] + ": "
                : ""
              : ""
          } ${item?.value?.formattedText || ""}`
      ) || [];

    return {
      link,
      result: offers?.map((item) => item.trim()),
    };
  } catch (err) {
    console.log("Error at flipkart offer scrapper->", err);
    return {};
  }
};

const tatacliqProductOfferScrapper = async (link) => {
  if (!link) return {};
  try {
    const productId = link.slice(link?.lastIndexOf("p-") + 2);
    if (!productId) return {};

    const productDetailsResponse = await axios(
      `https://www.tatacliq.com/marketplacewebservices/v2/mpl/products/productDetails/${productId}?isPwa=true&isMDE=true&strategy=new`
    );
    const productDetails = productDetailsResponse.data;
    let sellerId = productDetails?.winningSellerID;

    if (!sellerId) {
      const sellerDetailsResponse = await axios(
        `https://www.tatacliq.com/marketplacewebservices/v2/mpl/products/productDetails/${productId}/sellers?channel=web`
      );
      const sellerDetails = sellerDetailsResponse.data;
      sellerId = sellerDetails?.sellers[0].sellerId;
      if (!sellerId) return {};
    }
    const brandCode = productDetails?.brandURL.slice(
      productDetails?.brandURL?.lastIndexOf("c-") + 2
    );
    const categoryId = productDetails?.categoryHierarchy?.pop()?.category_id;
    const offerDetailsResponse = await axios.get(
      `https://www.tatacliq.com/marketplacewebservices/v2/mpl/products/${productId}/pdpOfferCallout?sellerId=${sellerId}&categoryCode=${categoryId}&brandCode=${brandCode}&channel=web&updatedFlag=true`
    );

    const offerDetails = offerDetailsResponse.data;
    const otherOffers = Array.isArray(offerDetails.otherOffers)
      ? offerDetails?.otherOffers?.map((item) => item?.offerHighlights || "") ||
        []
      : [];
    const bankOffers = Array.isArray(offerDetails.bankofferList)
      ? offerDetails?.bankofferList?.map(
          (item) => item?.offerHighlights || ""
        ) || []
      : [];

    const offers = [...bankOffers, ...otherOffers];

    return {
      link,
      result: offers,
    };
  } catch (err) {
    console.log("Error at tatacliq offer scrapper->", err);
    return {};
  }
};

const relianceProductOfferScrapper = async (link) => {
  if (!link) return {};

  try {
    const response = await axios.get(link);

    const text = response.data;

    const slicedText = text.slice(text.indexOf(`$bankEmiData`));
    const slicedText2 = slicedText.slice(slicedText.indexOf(`{`));
    const lastPairIndex = getClosingPairIndex(slicedText2);
    const slicedText3 = slicedText2.slice(0, lastPairIndex + 1);

    const parsed = JSON.parse(slicedText3);
    const jsonData = parsed?.productData?.potentialPromotions;

    const offers = Array.isArray(jsonData)
      ? jsonData.map((item) => item.title)
      : [];

    return {
      link,
      result: offers,
    };
  } catch (err) {
    console.log("Error at reliance offer scrapper->", err);
    return {};
  }
};

const amazonProductOfferScrapper = async (link) => {
  if (!link) return {};
  try {
    const linkRoute = link.slice(link.indexOf("dp/") + 3);
    const asin = linkRoute.slice(0, linkRoute.indexOf("/"));

    const bankOfferLink = `https://www.amazon.in/gp/product/ajax?deviceType=web&asin=${asin}&productGroupID=wireless_display_on_website&variationalParentASIN=&isB2BCustomer=false&experienceId=abc${asin}&showFeatures=sopp,inemi,promotions,vendorPoweredCoupon,sns&language=en_IN&isPrime=false&featureParams=viewName:bankOfferSecondaryView`;
    const response = await axios
      .get(bankOfferLink)
      .catch((err) => console.log(err));
    const text = response?.data;
    const root = parse(text);
    const offerElements = Array.from(
      root.querySelectorAll(".a-row.a-spacing-medium")
    ).map((item) => (item.textContent ? item.textContent?.trim() : ""));

    const result = offerElements
      .map((item) => {
        let output = item;
        const howIndex = output.lastIndexOf("Here's how");
        if (howIndex > -1) output = output.slice(0, howIndex);
        return output;
      })
      .map((item) => item.trim());

    return {
      link,
      result,
    };
  } catch (err) {
    console.log("Error at amazon offer scrapper->", err);
    return {};
  }
};

const cromaProductOfferScrapper = async (link, programId = "") => {
  if (!link || !programId) return {};
  try {
    const linkRoute = link.slice(link.indexOf("/p/") + 3);
    const productId = linkRoute.slice(0, linkRoute.indexOf("?"));

    const offerUrl = `https://api.tatadigital.com/getApplicablePromotion/getApplicationPromotionsForItemOffer`;
    const response = await axios
      .post(
        offerUrl,
        {
          getApplicablePromotionsForItemRequest: {
            itemId: productId,
            programId,
            status: "ACTIVE",
          },
        },
        {
          headers: {
            client_id: "CROMA",
          },
        }
      )
      .catch((err) => console.log(err));
    const data =
      response?.data?.getApplicablePromotionsForItemResponse?.offerDetailsList;

    return {
      link,
      result: Array.isArray(data) ? data.map((item) => item.description) : [],
    };
  } catch (err) {
    console.log("Error at croma offer scrapper->", err);
    return {};
  }
};

module.exports = {
  flipkartProductOfferScrapper,
  tatacliqProductOfferScrapper,
  relianceProductOfferScrapper,
  amazonProductOfferScrapper,
  cromaProductOfferScrapper,
};
