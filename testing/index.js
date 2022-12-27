const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const path = require("path");
const axios = require("axios");
const { getClosingPairIndex } = require("./util");
const uuid = require("uuid");
const gql = require("gql-query-builder");
const {
  sortOptionsExpanded,
  availableSortOptions,
  allScrappersList,
} = require("./constant");
const { parse } = require("node-html-parser");
var request = require("request-promise");

const {
  hotelSuggestions,
  hotelsDotComHotelScrapper,
  bookingsHotelScrapper,
  goibiboHotelScrapper,
  oyoHotelScrapper,
  amazonProductsScrapper,
  agodaSuggestions,
  agodaHotelScrapper,
  oyoSuggestions,
  makeMyTripSuggestions,
} = require("../consumer-basic/scrappers");
const {
  getUrlParamForSort,
  getUrlParamForFilters,
} = require("../consumer-medium/util");
const {
  extractNumberFromString,
  requestWithQueueServer,
} = require("../consumer-basic/util");
const {
  hotelsDotComSuggestions,
  makeMyTripHotelScrapper,
} = require("../consumer-medium/scrappers");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let browser;

(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      // "--proxy-server=140.227.211.47",
    ],
  });

  console.log("Browser established");
})();

const assignPage = async (blockImages = false) => {
  let page = await browser.newPage();

  // to prevent blocking by some browser due to headless user agent - add user agent from normal chrome browser
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/185.126.200.152:3128 Safari/537.36"
  );
  if (blockImages) {
    await page.setRequestInterception(true);

    page.on("request", (req) => {
      const resourceType = req.resourceType();

      if (resourceType == "image") {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  return page;
};

const meeshoProductsScrapper = async (search, assignPage) => {
  if (!assignPage) return [];
  const page = await assignPage();
  try {
    if (!page || !search) {
      await page.close();
      return [];
    }

    const reqUrl = `https://www.meesho.com/api/v1/products/search`;

    await page.setRequestInterception(true);
    page.once("request", (request) => {
      var data = {
        method: "POST",
        postData: JSON.stringify({
          query: search,
          type: "text_search",
          page: 1,
          offset: 0,
          limit: 20,
        }),
        headers: {
          ...request.headers(),
          "content-type": "application/json",
          accept: "application/json, text/plain, */*",
        },
      };

      request.continue(data);
    });

    await page
      .goto(reqUrl, {
        waitUntil: "domcontentloaded",
      })
      .catch((err) => console.log(err));

    const stringData = await page.evaluate(
      () => document.querySelector("body").textContent
    );
    const parsedData = JSON.parse(stringData);
    const catalogs = parsedData?.catalogs;

    const data = Array.isArray(jsonData?.catalogs)
      ? jsonData.catalogs
          .map((item) => ({
            id: uuid.v4(),
            title: item.name || "",
            price: `₹ ${item.transient_price || "nan"}`,
            image: Array.isArray(item.product_images)
              ? item.product_images[0]?.url
              : "",
            offers: Array.isArray(item?.promo_offers)
              ? item.promo_offers.map((offer) => offer.discount_text)
              : [],
            link: `https://www.meesho.com/${item.slug}/p/${item.product_id}`,
            ratings: {
              totalReviews: item?.catalog_reviews_summary?.review_count || 0,
              rating: item?.catalog_reviews_summary?.average_rating || 0,
            },
          }))
          .slice(0, 20)
      : [];

    await page.close();
    return data;
  } catch (err) {
    await page.close();
    console.log("Error occurred in meesho scrapper ->", err);
    return [];
  }
};

const flipkartProductsScrapper = async (search, sort, filters) => {
  try {
    if (!search) {
      return [];
    }

    const url = `https://www.flipkart.com/search?q=${search}`;

    const response = await axios.get(url).catch((err) => void err);

    const text = response.data;

    const slicedText = text.slice(text.indexOf(`pageDataV4`));
    const slicedText2 = slicedText.slice(
      slicedText.indexOf(`{`),
      slicedText.indexOf("</script")
    );
    const lastPairIndex = getClosingPairIndex(slicedText2);
    const slicedText3 = slicedText2.slice(0, lastPairIndex + 1);

    const parsed = JSON.parse(slicedText3);
    const rawSlotsData = parsed?.page?.data;
    const slots = [];
    if (typeof rawSlotsData == "object") {
      for (let key in rawSlotsData) {
        const arr = rawSlotsData[key];
        if (Array.isArray(arr)) slots.push(...arr);
      }
    }
    const filteredExpandedSlots = [];
    slots
      .filter((item) => Array.isArray(item?.widget?.data?.products))
      .forEach((item) => {
        item.widget.data.products.forEach((elem) => {
          if (elem?.productInfo?.value && filteredExpandedSlots.length < 20)
            filteredExpandedSlots.push(elem.productInfo.value);
        });
      });

    const result = filteredExpandedSlots.map((item) => {
      const rawImage = item.media.images[0].url;
      const slicedImage = rawImage.slice(0, rawImage.lastIndexOf("?"));
      const finalImage = slicedImage
        .replace(`{@width}`, 300)
        .replace("{@height}", 900);

      return {
        id: uuid.v4(),
        keySpecs: item.keySpecs,
        link: `https://www.flipkart.com${item.baseUrl}`,
        title: item?.titles?.title,
        price: `${item.pricing?.finalPrice?.currency || ""} ${
          item.pricing?.finalPrice?.value || "Nan"
        }`,
        brand: item?.productBrand,
        image: finalImage,
        ratings: {
          totalReviews: item?.rating?.count || 0,
          rating: item?.rating?.average || 0,
        },
      };
    });

    return result;
  } catch (err) {
    console.log("Error occurred in flipkart scrapper ->", err);
    return [];
  }
};

const cromaProductOfferScrapper = async (link) => {
  if (!link) return {};
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
            programId: "01eae2ec-0576-1000-bbea-86e16dcb4b79",
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

// blinkit api - https://blinkit.com/v5/search/merchants/30782/products/?q=rice&size=20
// big basket api - https://www.bigbasket.com/custompage/getsearchdata/?slug=rice&type=deck

// const zomatoScrapper = async () => {
//   // get loc - https://www.zomato.com/webroutes/location/search?q=sonipat
//   // get search result https://www.zomato.com/webroutes/search/autoSuggest?addressId=0&entityId=11398&entityType=city&isOrderLocation=1&cityId=11398&latitude=28.9930822999999900&longitude=77.0150735000000000&entityName=Sonipat&orderLocationName=Sonipat&cityName=Sonipat&countryId=1&countryName=India&displayTitle=Sonipat&o2Serviceable=true&placeId=22324&cellId=4111135597224001536&deliverySubzoneId=22324&placeType=DSZ&placeName=Sonipat&isO2City=true&isO2OnlyCity=true&q=gol&context=delivery
// };

// app.get("/food", async (req, res) => {
//   // https://www.zomato.com/webroutes/search/autoSuggest?addressId=0&entityId=172804&entityType=subzone&isOrderLocation=0&latitude=28.993&longitude=77.021&userDefinedLatitude=28.9960744&userDefinedLongitude=77.0234265&entityName=Sonipat Bus Stand, Shivaji Colony, Balmiki Basti, Sonipat, Haryana, India, India&countryId=1&countryName=India&o2Serviceable=true&isO2City=true&fetchFromGoogle=true&fetchedFromCookie=true&isO2OnlyCity=true&addressBlocker=0&otherRestaurantsUrl&q=para&context=delivery
//   const location = req.query.location ? JSON.parse(req.query.location) : "";
//   if (!location?.latitude || !location?.longitude) {
//     res.status(404).json({
//       data: {},
//     });
//     return;
//   }
//   const food = req.query.food;
//   const restaurant = req.query.food;
//   const page = await assignPage(true);

//   page.goto(
//     `https://www.zomato.com/webroutes/search/autoSuggest?addressId=0&entityId=${location.entityId}&entityType=${location.entityType}subzone&isOrderLocation=0&latitude=${location.latitude}&longitude=${location.longitude}&userDefinedLatitude=${location.latitude}&userDefinedLongitude=${location.longitude}&entityName=${location.entityName}&countryId=1&countryName=India&o2Serviceable=true&isO2City=true&fetchFromGoogle=true&fetchedFromCookie=true&isO2OnlyCity=true&addressBlocker=0&otherRestaurantsUrl&q=para&context=delivery`
//   );

//   // await zomatoScrapper(location, food, restaurant);
//   // console.log(location);

//   res.status(200).json({
//     data: {
//       message: "Working on it",
//     },
//   });
// });

app.get("/get-location/:search", async (req, res) => {
  const search = req.params.search;
  const page = await assignPage();

  //zomato
  let zomatoData;
  try {
    // https://api.scrapingdog.com/scrape?api_key=630ed6fc1fb6970dc52143dc&url=https://mapi.goibibo.com/autosuggest/v5/search?language=eng&region=in&q=pahar&z=false&brand=GI
    const proxyUrl = `http://api.scraperapi.com?api_key=13b975af66c8cf5f2399ee7d6d362f7b&url=https://www.zomato.com/webroutes/location/search?q=${search}`;
    const url = `https://www.zomato.com/webroutes/location/search?q=${search}`;

    page.goto(proxyUrl, {
      waitUntil: "domcontentloaded",
    });
    const response = await page.waitForResponse((res) => {
      if (res.url().includes("webroutes") && res.request().method() == "GET")
        return res;
    });

    zomatoData = (await response.json()).locationSuggestions;
  } catch (err) {
    console.log("error getting locations from Zomato->", err);
    zomatoData = [];
  }

  //swiggy
  let swiggyData;
  try {
    page.goto(
      `https://www.swiggy.com/dapi/misc/place-autocomplete?input=${search}`,
      {
        waitUntil: "domcontentloaded",
      }
    );
    const response2 = await page.waitForResponse((res) => {
      if (res.url().includes("autocomplete") && res.request().method() == "GET")
        return res;
    });
    swiggyData = (await response2.json()).data;
  } catch (err) {
    console.log("error getting locations from Swiggy->", err);
    swiggyData = [];
  }

  const resultedLocations = zomatoData
    .filter((item) =>
      swiggyData.some((item2) => item?.place?.place_id === item2?.place_id)
    )
    .map((item) => ({
      name: item.place?.place_name,
      majorName: item.place?.place_name_main,
      placeId: item.place?.place_id,
      latitude: item.place?.latitude,
      longitude: item.place?.longitude,
      entityId: item.entity_id,
      entityType: item.entity_type,
      entityName: item.entity_name,
      entityTitle: item.entity_title,
    }));

  res.status(200).json({
    data: {
      locations: resultedLocations,
    },
  });
  await page.close();
});

const hotelsScrapper = async (options) => {
  try {
    if (typeof options !== "object") return [];
    const hotelsDotComObj = {
      label: "Paharganj, New Delhi, National",
      shortName: "Paharganj",
      lat: 28.644795859510538,
      long: 77.21385955073411,
      regionName:
        "Paharganj, New Delhi, National Capital Territory of Delhi, India",
      regionId: "6084338",
      rooms: 1,
      from: "hotels",
      checkInDate: new Date("2022-08-27"),
      checkOutDate: new Date("2022-09-02"),
      adults: 2,
      children: [3, 12],
    };

    const bookingsObj = {
      label: "Paharganj, New Delhi, Delhi NCR, India",
      lat: 28.64432,
      long: 77.214714,
      destId: "2471",
      destType: "district",
      from: "bookings",
      rooms: 1,
      checkInDate: new Date("2022-08-31"),
      checkOutDate: new Date("2022-09-02"),
      adults: 2,
      // children: [3, 12],
    };

    const goibiboObj = {
      label: "Paharganj, Delhi",
      lat: 28.64804,
      long: 77.21299,
      voyId: "2820046943342890302",
      id: "RGNCR",
      from: "goibibo",
      rooms: 2,
      checkInDate: new Date("2022-10-02"),
      checkOutDate: new Date("2022-10-08"),
      adults: 2,
      children: [3, 12],
    };

    const oyoObj = {
      id: "oyo-locality-19359750",
      locationType: "locality",
      label: "Paharganj, New Delhi, Delhi",
      lat: 28.64804,
      long: 77.21299,
      from: "oyo",
      rooms: 1,
      checkInDate: new Date("2022-08-31"),
      checkOutDate: new Date("2022-09-02"),
      adults: 2,
    };

    const results = await Promise.all([
      // hotelsDotComHotelScrapper({
      //   ...hotelsDotComObj,
      // }),
      bookingsHotelScrapper({
        ...bookingsObj,
      }),
      goibiboHotelScrapper({
        ...goibiboObj,
      }),
      // oyoHotelScrapper({
      //   ...oyoObj,
      // }),
    ]);

    return results;
  } catch (err) {
    console.log("Error occurred in hotelsScrapper scrapper ->", err);
    return [];
  }
};

const hotelSuggestionsSearch = async (search) => {
  try {
    const result = await hotelsDotComSuggestions(search);
    return result;
  } catch (err) {
    console.log("Error occurred in hotelSuggestionsSearch scrapper ->", err);
    return [];
  }
};

const runFunc = async (search) => {
  const options = {
    _id: "b62c0fa6-b748-408f-9070-bd095403cf63",
    asq: "u2qcKLxwzRU5NDuxJ0kOF3T91go8JoYYMxAgy8FkBH1BN0lGAtYH25sdXoy34qb9jKxhRNDjWa7phMcSyYhoel23zpLKK8hPNMFhzVhQ3TCYTw2MbjiGBPAdv7XiCco04paTD5VHq5sFdVCiCn7snpbeSIvW1m%2FTwXQTiHc4oIUQxYgyS28UGyllinau2PJ%2BnIIutc3p1CH6n5pZ6mkKMg%3D%3D",
    area: "550626",
    tick: "638069663517",
    category: "Area",
    label: "Murthal, Sonipat",
    lat: 0,
    long: 0,
    cityId: 513298,
    objectId: 550626,
    from: "agoda-suggest",
    price: 0,
    adults: 1,
    checkInDate: "Fri Dec 23 2022",
    checkOutDate: "Wed Dec 28 2022",
    rooms: 1,
  };

  const result = await agodaHotelScrapper(options);

  return result;
};

app.get("/run", async (req, res) => {
  const result = await runFunc("");

  res.status(200).json({
    result,
  });
});

app.get("/test", async (req, res) => {
  // const result = await hotelsScrapper({});
  const result = await hotelsDotComSuggestions("sonip", assignPage);

  res.status(200).json({
    result,
  });
});

app.get("/test2", async (req, res) => {
  const search = req.query.search;
  const result = await amazonProductsScrapper(search || "blue shirt");

  res.status(200).json({
    result,
  });
});

app.post("/request", async (req, res) => {
  const body = req.body;
  if (!body.type) {
    res.status(400).json({
      success: false,
      message: "type not available",
    });
    return;
  }
  if (!body.url) {
    res.status(400).json({
      success: false,
      message: "url not available",
    });
    return;
  }
  const isGetReq = body.type.toLowerCase() == "get" ? true : false;
  const headers = body.headers || {};
  const url = body.url;
  const mainBody = body.body || {};

  let response, data;
  const config = {
    headers,
  };
  try {
    if (isGetReq) response = await axios.get(url, config);
    else response = await axios.post(url, mainBody, config);
    data = response.data;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error making req",
      error: err,
      errorString: err + "",
    });
    return;
  }

  res.status(200).json({ success: true, data });
});

app.listen(process.env.PORT || 5500, () => {
  console.log(`Backend is up at : ${process.env.PORT || 5500}`);
});
