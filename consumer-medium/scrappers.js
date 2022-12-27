const uuid = require("uuid");
const { allScrappersList, suggestionScrapperList } = require("./constant");
const unescapeJs = require("unescape-js");

const {
  getUrlParamForSort,
  getUrlParamForFilters,
  getClosingPairIndex,
  extractNumberFromString,
} = require("./util");

const amazonProductsScrapper = async (search, assignPage, sort, filters) => {
  if (!assignPage) return [];
  const page = await assignPage(true);
  try {
    if (!page || !search) {
      await page.close();
      return [];
    }
    const url = `https://www.amazon.in/s?k=${search}${getUrlParamForFilters(
      filters,
      allScrappersList.amazon
    )}${getUrlParamForSort(sort, allScrappersList.amazon)}`;

    await page
      .goto(url, {
        waitUntil: "domcontentloaded",
      })
      .catch((err) => console.log(err));

    const result = await page.evaluate(() => {
      const resultItems = Array.from(
        document.querySelectorAll(".s-result-item")
      );
      return resultItems
        .filter(
          (item) =>
            item &&
            item?.getAttribute &&
            item.getAttribute("data-component-type") == "s-search-result" &&
            !item
              .querySelector(".s-image")
              ?.getAttribute("alt")
              ?.includes("ponsored")
        )
        .slice(0, 20)
        .map((item) => {
          let output = {};
          try {
            const imgElem = item.querySelector(".s-image");
            const titleLinkElem = item.querySelector(
              ".s-title-instructions-style h2 a"
            );
            const titleElem = item.querySelector(
              ".s-title-instructions-style h2 span"
            );
            const priceSymbolElem = item.querySelector(
              ".s-price-instructions-style .a-price-symbol"
            );
            const priceWholeElem = item.querySelector(
              ".s-price-instructions-style .a-price-whole"
            );
            const brandElem = item.querySelector(
              ".a-row.a-size-base.a-color-secondary h5"
            );

            const ratingElem = item.querySelector(".a-icon-star-small");
            let rating = "";
            if (
              ratingElem &&
              ratingElem?.classList &&
              ratingElem?.classList?.length > 0
            ) {
              const ratingClassList = Array.from(ratingElem.classList);
              const ratingClass =
                ratingClassList?.length > 0
                  ? ratingClassList.find((item) =>
                      item.includes("a-star-small")
                    )
                  : "";
              if (ratingClass) rating = ratingClass.slice(13).replace("-", ".");
            }
            const ratingCountElem = item.querySelector(
              ".a-size-base.s-underline-text"
            );
            output = {
              title: titleElem?.textContent || "",
              link: titleLinkElem?.href || "",
              image: imgElem?.src || "",
              price: `${priceSymbolElem?.textContent || ""}${
                priceWholeElem?.textContent || "Nan"
              }`,
              brand: brandElem?.textContent || "",
              ratings: {
                totalReviews: ratingCountElem?.textContent || 0,
                rating: rating || 0,
              },
            };
          } catch (err) {
            output = {};
          }
          return output;
        });
    });

    const finalResult = result.map((item) =>
      Object.keys(item).length > 0 ? { ...item, id: uuid.v4() } : {}
    );

    await page.close();
    return finalResult;
  } catch (err) {
    await page.close();
    console.log("Error occurred in amazon scrapper ->", err);
    return [];
  }
};

const jiomartProductsScrapper = async (search, assignPage) => {
  if (!assignPage) return [];
  const page = await assignPage(true);
  try {
    if (!page || !search) {
      await page.close();
      return [];
    }
    page
      .goto(`https://www.jiomart.com/catalogsearch/result?q=${search}`, {
        waitUntil: "domcontentloaded",
      })
      .catch((err) => void err);
    const response = await page.waitForResponse((res) => {
      if (res.url().includes("algolia") && res.request().method() == "POST")
        return res;
    });
    const jsonData = await response.json();
    const data =
      Array.isArray(jsonData.results) && Array.isArray(jsonData.results[0].hits)
        ? jsonData.results[0].hits
            .map((item) => ({
              id: uuid.v4(),
              title: item.display_name || "",
              price: `₹ ${item.avg_selling_price || "nan"}`,
              image: `https://www.jiomart.com/${item.thumbnail_url}`,
              link: `https://www.jiomart.com/${item.url_path}`,
            }))
            .slice(0, 20)
        : [];

    await page.close();
    return data;
  } catch (err) {
    await page.close();
    console.log("Error occurred in jiomart scrapper ->", err);
    return [];
  }
};

const myntraProductsScrapper = async (search, assignPage) => {
  if (!assignPage) return [];
  const page = await assignPage(true);
  try {
    if (!page || !search) {
      await page.close();
      return [];
    }
    page.goto(`https://www.myntra.com/${search}`).catch((e) => void e);
    const response = await page.waitForResponse((response) => {
      if (response.request().url().includes("myntra.com")) return response;
    });

    const text = await response.text();
    const slicedText = text.slice(text.indexOf("searchData"));
    const slicedText2 = slicedText.slice(0, slicedText.indexOf("sortOp"));
    const slicedText3 = `{"${slicedText2.slice(
      slicedText2.indexOf("products"),
      slicedText2.lastIndexOf(",")
    )}}`;

    const parsed = JSON.parse(slicedText3);
    const data = Array.isArray(parsed?.products)
      ? parsed.products
          .map((item) => ({
            id: uuid.v4(),
            title: item.productName || "",
            price: `₹ ${item.price || "nan"}`,
            image: item.searchImage || "",
            ratings: {
              totalReviews: item?.ratingCount || 0,
              rating: item?.rating ? item.rating.toFixed(2) : 0,
            },
            link: `https://www.myntra.com/${item.landingPageUrl}`,
          }))
          .slice(0, 20)
      : [];

    await page.close();
    return data;
  } catch (err) {
    await page.close();
    console.log("Error occurred in myntra scrapper ->", err);
    return [];
  }
};

const hotelsDotComSuggestions = async (search, assignPage) => {
  if (!assignPage) return [];
  const page = await assignPage(true);
  try {
    if (!page || !search) {
      await page.close();
      return [];
    }

    const reqUrl = `https://in.hotels.com/api/v4/typeahead/${search}?browser=Chrome&client=Homepage&dest=true&device=Mobile&expuserid=-1&&format=json&lob=HOTELS&locale=en_IN&maxresults=8&personalize=true`;
    await page
      .goto(reqUrl, {
        waitUntil: "domcontentloaded",
      })
      .catch((err) => console.log(err));

    const stringData = await page.evaluate(
      () => document.querySelector("body").textContent
    );
    const parsedData = JSON.parse(stringData);
    const data = parsedData?.sr;

    if (!Array.isArray(data)) {
      await page.close();
      return [];
    }

    const finalData = data
      .map((item) => ({
        _id: uuid.v4(),
        label:
          item.regionNames?.fullName?.length > 30
            ? item.regionNames.fullName.slice(
                0,
                item.regionNames.fullName.indexOf(" ", 30)
              )
            : item.regionNames?.fullName,
        shortName: item.regionNames?.shortName,
        lat: parseFloat(item.coordinates?.lat),
        long: parseFloat(item.coordinates?.long),
        regionName: item.regionNames?.fullName,
        regionId: item.essId?.sourceId,
        from: suggestionScrapperList.hotels,
        type: item.type || "",
      }))
      .filter(
        (item) => item.label && item.type && item.type.toLowerCase() == "city"
      );

    await page.close();
    return finalData;
  } catch (err) {
    await page.close();
    console.log("Error occurred in hotelsDotComSuggestions scrapper ->", err);
    return [];
  }
};

const hotelsDotComHotelScrapper = async (options, assignPage) => {
  if (!assignPage) return [];
  const page = await assignPage(true);
  try {
    if (!page) {
      await page.close();
      return [];
    }

    if (
      typeof options !== "object" ||
      !options.rooms ||
      !options.adults ||
      !options.checkInDate ||
      !options.checkOutDate ||
      !options.regionName ||
      !options.regionId ||
      !options.lat ||
      !options.long
    ) {
      await page.close();
      return [];
    }

    const adults = Array(parseInt(options.rooms))
      .fill("")
      .map((_i) => options.adults)
      .join(",");
    const children =
      Array.isArray(options.children) && options.children.length > 0
        ? "&children=" +
          Array(parseInt(options.rooms))
            .fill("")
            .map(
              (_i, index) =>
                `${index + 1}_` + `${options.children.join(`,${index + 1}_`)}`
            )
        : "";
    const checkInDate = new Date(options.checkInDate)
      .toLocaleDateString("en-in")
      .split("/")
      .reverse()
      .join("-");
    const checkOutDate = new Date(options.checkOutDate)
      .toLocaleDateString("en-in")
      .split("/")
      .reverse()
      .join("-");

    const reqUrl = `https://in.hotels.com/Hotel-Search?adults=${adults}${children}&d1=${checkInDate}&d2=${checkOutDate}&destination=${options.regionName}&endDate=${checkOutDate}&hotels-destination=${options.regionName}&latLong=${options.lat},${options.long}&localDateFormat=dd/MM/yyyy&partialStay=false&regionId=${options.regionId}&sort=RECOMMENDED&startDate=${checkInDate}`;

    await page
      .goto(reqUrl, {
        waitUntil: "domcontentloaded",
      })
      .catch((err) => console.log(err));
    const text = await page.evaluate(
      () => document.querySelector("body").textContent
    );
    const slicedText = text.slice(text.indexOf("window.__PLUGIN_STATE__ ="));
    const slicedText2 = slicedText.slice(
      slicedText.indexOf(`{`),
      slicedText.indexOf("</script")
    );
    const lastPairIndex = getClosingPairIndex(slicedText2);
    const sliceText3 = slicedText2.slice(0, lastPairIndex + 1);
    const unescaped = unescapeJs(sliceText3);
    const parsed = JSON.parse(unescaped);
    const data = parsed?.mobx?.stores?.searchResults?.propertySearchListings;

    if (!Array.isArray(data)) {
      await page.close();
      return [];
    }

    const finalData = data
      .map((item) => {
        const model = item.model;
        const summarySection = model.summarySections
          ? model.summarySections[0]
          : {};
        const [ratingsStr, reviewsStr] = summarySection.guestRating
          ?.accessibilityLabel
          ? summarySection.guestRating.accessibilityLabel.split("(")
          : ["", ""];
        const listItems = summarySection.footerMessages?.listItems || [];
        const images = model?.mediaSection?.gallery?.media || [];

        const price = model?.priceSection?.priceSummary?.options
          ? extractNumberFromString(
              model?.priceSection?.priceSummary?.options[0]?.displayPrice
                ?.formatted
            )
          : 0;

        return {
          id: uuid.v4(),
          name: model?.headingSection?.heading || "",
          price: price,
          rating: ratingsStr.replace(" out of ", "/")?.split(" ")[0],
          reviews: reviewsStr ? reviewsStr.split(" ")[0] : "",
          area: model?.headingSection?.messages
            ? model?.headingSection?.messages[0].text
            : "",
          link: model?.cardLink?.resource?.value
            ? model?.cardLink?.resource?.value?.replaceAll("u002F", "/")
            : "",
          image: images[0]?.media?.url?.replaceAll("u002F", "/"),
          images: images.map((item) =>
            item?.media?.url?.replaceAll("u002F", "/")
          ),
          extraInfo: listItems
            .filter((item) => item.style == "POSITIVE")
            .map((item) => item.text),
          address: "",
        };
      })
      .filter((item) => item.name && item.price);

    await page.close();
    return finalData;
  } catch (err) {
    await page.close();
    console.log("Error occurred in hotelsHotelScrapper scrapper ->", err);
    return [];
  }
};

const goibiboSuggestions = async (search, assignPage) => {
  if (!assignPage) return [];
  const page = await assignPage(true);
  try {
    if (!page || !search) {
      await page.close();
      return [];
    }

    const reqUrl = `https://voyagerx.goibibo.com/api/v1/hotels_search/find_node_by_name/?search_query=${search}&limit=8&qt=N&inc_ggl_res=true&add_t=region`;
    await page
      .goto(reqUrl, {
        waitUntil: "domcontentloaded",
      })
      .catch((err) => console.log(err));
    const stringData = await page.evaluate(
      () => document.querySelector("body").textContent
    );
    const parsedData = JSON.parse(stringData);
    const data = parsedData?.data?.r;

    if (!Array.isArray(data)) {
      await page.close();
      return [];
    }

    const finalData = data
      .filter((item) => item.t !== "hotel")
      .map((item) => ({
        _id: uuid.v4(),
        label: item.n,
        lat: Array.isArray(item.crd) ? item.crd[0] : "",
        long: Array.isArray(item.crd) ? item.crd[1] : "",
        voyId: item._id,
        id: item._id,
        from: suggestionScrapperList.goibibo,
      }))
      .slice(0, 8);

    await page.close();
    return finalData;
  } catch (err) {
    console.log("inside catch", err);
    console.log("Error occurred in goibiboSuggestions scrapper ->", err);
    await page.close();
    return [];
  }
};

const goibiboHotelScrapper = async (options, assignPage) => {
  if (!assignPage) return [];
  const page = await assignPage();
  try {
    if (!page) {
      await page.close();
      return [];
    }
    if (
      typeof options !== "object" ||
      !options.adults ||
      !options.rooms ||
      !options.checkInDate ||
      !options.checkOutDate ||
      !options.voyId ||
      !options.lat ||
      !options.long
    ) {
      await page.close();
      return [];
    }

    const children =
      Array.isArray(options.children) && options.children.length > 0
        ? options.children.length + "-" + options.children.join("_")
        : "0";
    const checkInDateArray = new Date(options.checkInDate)
      .toLocaleDateString("en-in")
      .split("/")
      .reverse();
    const checkOutDateArray = new Date(options.checkOutDate)
      .toLocaleDateString("en-in")
      .split("/")
      .reverse();

    const reqUrl = `https://hermes.goibibo.com/hotels/v13/search/data/v3/${
      options.voyId
    }/${checkInDateArray.join("")}/${checkOutDateArray.join("")}/${
      options.rooms
    }-${
      options.adults
    }-${children}?s=popularity&cur=INR&tmz=-330&entity_type=regions`;

    await page.setRequestInterception(true);
    page.once("request", (request) => {
      request.continue({
        headers: {
          ...request.headers(),
          "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
          referer: "https://www.goibibo.com/",
        },
      });
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

    const data = parsedData?.data;
    const cityInfo = parsedData?.city_meta_info;
    if (!Array.isArray(data)) {
      await page.close();
      return [];
    }

    const finalData = data
      .map((item) => {
        const extraPoints = [];
        if (Array.isArray(item.bpp) && item.bpp.length > 0 && item.bpp[0]?.pt)
          extraPoints.push(...item.bpp.map((item) => item.pt));
        if (Array.isArray(item.cp1) && item.cp1.length > 0 && item.cp1[0]?.pt)
          extraPoints.push(...item.cp1.map((item) => item.pt));
        if (Array.isArray(item.arp) && item.arp.length > 0 && item.arp[0]?.pt)
          extraPoints.push(
            ...item.arp.map((item) => {
              let text = item?.htd?.ht ? item?.htd?.ht[0] : item.pt;
              if (text && text.includes("considered")) text = item.pt;
              return text;
            })
          );

        const nameModified = item.hn
          ?.toLowerCase()
          ?.replace(/[^a-z 0-9]/g, "")
          ?.replace(/hotels|hotel/g, "")
          ?.replaceAll("  ", " ")
          ?.replaceAll("  ", " ")
          ?.replaceAll(" ", "-");
        const link = `https://www.goibibo.com/hotels/${nameModified}-hotel-in-${cityInfo.ct?.toLowerCase()}-${
          item.hc
        }/?hquery={"ci":"${checkInDateArray.join(
          ""
        )}","co":"${checkOutDateArray.join("")}","r":"${options.rooms}-${
          options.adults
        }-${children}","ibp":""}&cc=IN`;

        return {
          id: uuid.v4(),
          name: item.hn || "",
          price: item.spr || 0,
          rating: item.gr ? `${item.gr}/5` : "",
          reviews: item.grc || 0,
          area: item.l || "",
          address: "",
          link,
          image: item.t || "",
          images: Array.isArray(item.si) ? item.si.slice(0, 6) : [item.t || ""],
          extraInfo: extraPoints,
        };
      })
      .filter((item) => item.name && item.price);

    await page.close();
    return finalData;
  } catch (err) {
    console.log("Error occurred in goibiboHotelScrapper scrapper ->", err);
    await page.close();
    return [];
  }
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
    if (!Array.isArray(catalogs)) {
      await page.close();
      return [];
    }

    const data = catalogs
      .map((item) => ({
        id: uuid.v4(),
        title: item.name || "",
        price: item.min_product_price || item.min_catalog_price,
        image: Array.isArray(item.product_images)
          ? item.product_images[0]?.url
          : item.image || "",
        link: `https://www.meesho.com/${item.slug}/p/${item.product_id}`,
        ratings: {
          totalReviews: item?.catalog_reviews_summary?.review_count || 0,
          rating: item?.catalog_reviews_summary?.average_rating || 0,
        },
      }))
      .slice(0, 20);

    await page.close();
    return data;
  } catch (err) {
    console.log("Error occurred in meesho scrapper ->", err);
    await page.close();
    return [];
  }
};

const generateMMTCode = (rooms, adults, children = []) => {
  if (!rooms || !adults || rooms > adults) return "";

  const minAdultsEachRoom = parseInt(adults / rooms);
  let remainingAdults = adults % rooms;
  const adultsArr = new Array(rooms).fill(minAdultsEachRoom).map((item) => {
    if (remainingAdults) {
      --remainingAdults;
      item += 1;
    }
    return item;
  });

  const getChildrenCode = (children = []) => {
    if (!children.length) return "e0e";
    return "e" + [children.length, ...children].join("e") + "e";
  };

  return `${adultsArr[0]}${getChildrenCode(children)}${
    adultsArr.slice(1).length ? adultsArr.slice(1).join("e0e") + "e0e" : ""
  }`;
};

const makeMyTripHotelScrapper = async (options, assignPage) => {
  if (!assignPage) return [];
  const page = await assignPage(true);
  try {
    if (!page) {
      await page.close();
      return [];
    }

    if (
      typeof options !== "object" ||
      !options.rooms ||
      !options.adults ||
      !options.checkInDate ||
      !options.checkOutDate ||
      !options.cityCode ||
      !options.type ||
      !options.label ||
      !options.lat ||
      !options.long
    ) {
      await page.close();
      return [];
    }

    const checkInDateArr = new Date(options.checkInDate)
      .toLocaleDateString("en-in", {
        year: "numeric",
        day: "2-digit",
        month: "2-digit",
      })
      .split("/");
    // [22,12,2022]
    const checkInDate = `${checkInDateArr[1]}${checkInDateArr[0]}${checkInDateArr[2]}`;

    const checkOutDateArr = new Date(options.checkOutDate)
      .toLocaleDateString("en-in", {
        year: "numeric",
        day: "2-digit",
        month: "2-digit",
      })
      .split("/");
    // [22,12,2022]
    const checkOutDate = `${checkOutDateArr[1]}${checkOutDateArr[0]}${checkOutDateArr[2]}`;

    const reqUrl = `https://www.makemytrip.com/hotels/hotel-listing/?checkin=${checkInDate}&city=${
      options.cityCode
    }&checkout=${checkOutDate}&roomStayQualifier=${generateMMTCode(
      options.rooms,
      options.adults,
      options.children
    )}&locusId=${options.cityCode}&country=${
      options.countryCode || "IN"
    }&locusType=${options.type}&searchText=${options.label}&regionNearByExp=3`;

    await page
      .goto(reqUrl, {
        waitUntil: "domcontentloaded",
      })
      .catch((err) => console.log(err));
    const text = await page.evaluate(
      () => document.querySelector("body").textContent
    );
    const slicedText = text.slice(text.indexOf("window.__INITIAL_STATE__ ="));
    const slicedText2 = slicedText.slice(
      slicedText.indexOf(`{`),
      slicedText.indexOf("</script")
    );
    const lastPairIndex = getClosingPairIndex(slicedText2);
    const sliceText3 = slicedText2.slice(0, lastPairIndex + 1);
    const parsed = JSON.parse(sliceText3);
    const personalizedSection = parsed?.hotelListing?.personalizedSections;
    if (!Array.isArray(personalizedSection)) {
      await page.close();
      return [];
    }
    const data = personalizedSection
      .map((item) => (Array.isArray(item.hotels) ? item.hotels : []))
      .reduce((acc, curr) => [...acc, ...curr], []);

    if (!Array.isArray(data)) {
      await page.close();
      return [];
    }

    const finalData = data
      .map((item) => ({
        id: uuid.v4(),
        name: item?.name || "",
        price: item?.priceDetail?.discountedPrice,
        rating: item?.reviewSummary?.cumulativeRating
          ? `${item?.reviewSummary?.cumulativeRating}/5`
          : "",
        reviews: item?.reviewSummary?.totalReviewCount,
        area: `${item?.locationPersuasion[0] || ""}, ${
          item?.locationDetail?.name
        }`,
        link: `https://www.makemytrip.com/hotels/hotel-details?${
          item?.appDeeplink.split("?")[1]
        }`,
        image: Array.isArray(item?.media) ? "https:" + item.media[1]?.url : "",
        images: Array.isArray(item?.media)
          ? item.media.map((i) => "https:" + i.url)
          : [],
        extraInfo: Array.isArray(item?.hotelPersuasions?.PC_MIDDLE_4?.data)
          ? [
              ...item.hotelPersuasions.PC_MIDDLE_4.data.map((e) => e.text),
              item?.extraMeals?.desc || "",
            ].filter((item) => item.trim())
          : [],
        address: item?.locationDetail?.name,
      }))
      .filter((item) => item.name && item.price);

    await page.close();
    return finalData;
  } catch (err) {
    await page.close();
    console.log("Error occurred in makeMyTripHotelScrapper scrapper ->", err);
    return [];
  }
};

module.exports = {
  amazonProductsScrapper,
  meeshoProductsScrapper,
  jiomartProductsScrapper,
  myntraProductsScrapper,
  goibiboSuggestions,
  hotelsDotComSuggestions,
  hotelsDotComHotelScrapper,
  goibiboHotelScrapper,
  makeMyTripHotelScrapper,
};
