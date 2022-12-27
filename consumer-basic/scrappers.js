const axios = require("axios");
const uuid = require("uuid");
const { parse } = require("node-html-parser");
const unescapeJs = require("unescape-js");

const {
  allScrappersList,
  availableFilterOptions,
  suggestionScrapperList,
  getAgodaCitySearchObj,
  getAgodaAreaSearchObj,
} = require("./constant");
const {
  getClosingPairIndex,
  getUrlParamForSort,
  getUrlParamForFilters,
  compareTwoStringsWrtShorter,
  extractNumberFromString,
  requestWithScrapper,
} = require("./util");
const { requestWithQueueServer } = require("./util");

const amazonProductsScrapper = async (search, sort, filters) => {
  if (!search) return [];
  try {
    const url = `https://www.amazon.in/s?k=${search}${getUrlParamForFilters(
      filters,
      allScrappersList.amazon
    )}${getUrlParamForSort(sort, allScrappersList.amazon)}`;

    const res = await axios.get(url);
    const text = res.data;
    const root = parse(text);

    const elements = Array.from(root.querySelectorAll(".s-result-item"));
    const results = elements
      .filter(
        (item) =>
          item &&
          item?.getAttribute &&
          !item
            .querySelector(".s-image")
            ?.getAttribute("alt")
            ?.includes("ponsored")
      )
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
          let link = titleLinkElem?.getAttribute("href") || "";
          if (link && !link.includes("amazon.in"))
            link = "https://amazon.in" + link;

          const ratingElem = item.querySelector(".a-icon-star-small span");
          let rating = ratingElem.textContent;
          if (rating)
            rating = rating
              .split(" out of ")
              .map((item) => parseFloat(item))
              .join("/");

          const ratingCountElem = item.querySelector(
            ".a-size-base.s-underline-text"
          );
          output = {
            title: titleElem?.textContent || "",
            link,
            image: imgElem?.getAttribute("src") || "",
            price: extractNumberFromString(
              `${priceSymbolElem?.textContent || ""}${
                priceWholeElem?.textContent || "Nan"
              }`
            ),
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
      })
      .filter((item) => item.title && item.price)
      .slice(0, 20);

    const finalResult = results.map((item) => ({ ...item, id: uuid.v4() }));

    return finalResult;
  } catch (err) {
    console.log("Error occurred in amazon scrapper ->", err);
    return [];
  }
};

const flipkartProductsScrapper = async (search, sort, filters) => {
  try {
    if (!search) {
      return [];
    }

    const url = `https://www.flipkart.com/search?q=${search}${getUrlParamForSort(
      sort,
      allScrappersList.flipkart
    )}${getUrlParamForFilters(filters, allScrappersList.flipkart)}`;

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
        .replace(`{@width}`, 370)
        .replace("{@height}", 480);

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

const oldFlipkartProductsScrapper = async (search, assignPage) => {
  if (!assignPage) return [];
  const page = await assignPage(true);

  try {
    if (!page || !search) {
      await page.close();
      return [];
    }

    await page.goto(`https://www.flipkart.com/search`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(600);
    await page.waitForSelector("#container .header-form-search div div input");
    await page.focus("#container .header-form-search div div input");
    await page.type("#container .header-form-search div div input", search);
    await page.keyboard.press("ArrowRight");
    page.keyboard.press("Enter");

    const finalResponse = await page.waitForResponse(async (response) => {
      if (
        response.url().includes("page/fetch") &&
        response.request().method() == "POST" &&
        response.status() == "200"
      ) {
        return response;
      }
    }, 50);
    const data = await finalResponse.json();
    const slots = data.RESPONSE?.slots;
    const filteredExpandedSlots = slots
      .filter((item) => item?.widget?.data?.products)
      .map((item) => item.widget.data.products[0]?.productInfo?.value)
      .slice(0, 20);
    const result = filteredExpandedSlots.map((item) => {
      const rawImage = item.media.images[0].url;
      const slicedImage = rawImage.slice(0, rawImage.lastIndexOf("?"));
      const finalImage = slicedImage
        .replace(`{@width}`, 600)
        .replace("{@height}", 1800);

      return {
        id: uuid.v4(),
        keySpecs: item.keySpecs,
        link: `https://flipkart.com${item.baseUrl}`,
        title: item?.titles?.title,
        price: `${item.pricing?.finalPrice?.currency || ""} ${
          item.pricing?.finalPrice?.value || "Nan"
        }`,
        image: finalImage,
        ratings: {
          totalReviews: item?.rating?.count || 0,
          rating: item?.rating?.average || 0,
        },
      };
    });
    await page.close();
    return result;
  } catch (err) {
    await page.close();
    console.log("Error occurred in flipkart scrapper ->", err);
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
    page.goto(`https://www.jiomart.com/catalogsearch/result?q=${search}`, {
      waitUntil: "domcontentloaded",
    });
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

const meeshoProductsScrapper = async (search, sort, filters) => {
  try {
    if (!search) {
      return [];
    }

    const response = await axios.post(
      "https://meesho.com/api/v1/products/search",
      {
        // query: `${search}${
        //   filters && filters[availableFilterOptions.gender]
        //     ? getUrlParamForFilters(filters, allScrappersList.meesho)
        //     : ""
        // }`,
        query: `${search}`,
        type: "text_search",
        page: 1,
        offset: 0,
        limit: 20,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const jsonData = await response.data;
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

    return data;
  } catch (err) {
    console.log("Error occurred in meesho scrapper ->", err);
    return [];
  }
};

const myntraProductsScrapper = async (search) => {
  try {
    if (!search) return [];

    const reqUrl = `https://www.myntra.com/${search}`;
    const res = await requestWithScrapper(reqUrl, 10000, 10000);

    if (!res.data) return [];
    const text = res.data;

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

    return data;
  } catch (err) {
    console.log("Error occurred in myntra scrapper ->", err);
    return [];
  }
};

const ajioProductsScrapper = async (search, sort, filters) => {
  try {
    if (!search) {
      return [];
    }

    const url = `https://www.ajio.com/search/?text=${search}:relevance${getUrlParamForFilters(
      filters,
      allScrappersList.ajio
    )}${getUrlParamForSort(sort, allScrappersList.ajio)}`;

    const response = await axios.get(url).catch((err) => void err);

    const text = response.data;

    const slicedText = text.slice(text.indexOf(`PRELOADED_STATE`));
    const slicedText2 = slicedText.slice(
      slicedText.indexOf(`{`),
      slicedText.indexOf("</script")
    );
    const slicedText3 = slicedText2.slice(0, slicedText2.lastIndexOf(`}`) + 1);
    const parsed = JSON.parse(slicedText3);
    const entities = parsed?.grid?.entities;
    let jsonData = [];
    if (typeof entities == "object") jsonData = Object.values(entities);

    const data = Array.isArray(jsonData)
      ? jsonData
          .map((item) => ({
            id: uuid.v4(),
            title: item.name || "",
            price: `₹${item.price?.value || "nan"}`,
            image: item.images?.length > 0 ? item.images[0].url : "",
            offerPrice: item?.offerPrice
              ? `₹${item.offerPrice?.value || "nan"}`
              : "",
            link: `https://www.ajio.com${item.url}`,
            brand: item?.fnlColorVariantData?.brandName || "",
          }))
          .slice(0, 20)
      : [];

    return data;
  } catch (err) {
    console.log("Error occurred in ajio scrapper ->", err);
    return [];
  }
};

// const nykaaProductsScrapper = async (search, sort, filters) => {
//   try {
//     if (!search) {
//       return [];
//     }

//     const response = await axios
//       .get(
//         `https://www.nykaa.com/search/result/?q=${search}${getUrlParamForSort(
//           sort,
//           allScrappersList.nykaa
//         )}`
//       )
//       .catch((err) => void err);

//     const text = response.data;

//     const slicedText = text.slice(text.indexOf(`window.__PRELOADED_STATE`));
//     const slicedText2 = slicedText.slice(
//       slicedText.indexOf(`{`),
//       slicedText.indexOf("</script")
//     );
//     const slicedText3 = slicedText2.slice(0, slicedText2.indexOf("window"));
//     const slicedText4 = slicedText3.slice(0, slicedText3.lastIndexOf(`}`) + 1);
//     const parsed = JSON.parse(slicedText4);
//     const products = parsed?.searchReducer?.searchData?.products;

//     const data = Array.isArray(products)
//       ? products
//           .map((item) => ({
//             id: uuid.v4(),
//             title: item.name || "",
//             brand: Array.isArray(item?.brand_name) ? item.brand_name[0] : "",
//             price: `₹${item.finalPrice || "nan"}`,
//             image: item.image || "",
//             ratings: {
//               totalReviews: item?.ratingCount || 0,
//               rating: item?.rating || 0,
//             },
//             offers: Array.isArray(item?.offers)
//               ? item.offers.map((elem) => elem.description)
//               : [],
//             link: item?.productURL || "",
//           }))
//           .slice(0, 20)
//       : [];

//     return data;
//   } catch (err) {
//     console.log("Error occurred in nykaa scrapper ->", err);
//     return [];
//   }
// };

const nykaaProductsScrapper = async (search) => {
  try {
    if (!search) {
      return [];
    }

    const response = await axios
      .get(
        `https://www.nykaafashion.com/rest/appapi/V2/categories/products?searchTerm=${search}&PageSize=12&sort=popularity&currentPage=1&filter_format=v2&currency=INR&country_code=IN&apiVersion=3&deviceType=WEBSITE`
      )
      .catch((err) => void err);

    const products = response.data?.response?.products;

    if (!Array.isArray(products)) return [];
    const data = products
      .map((item) => ({
        id: uuid.v4(),
        title: item.subTitle || "",
        brand: item.title || "",
        price: item.price || 0,
        image: item.imageUrl || "",
        ratings: {
          totalReviews: 0,
          rating: 0,
        },
        link: item?.actionUrl
          ? `https://www.nykaafashion.com${item.actionUrl}`
          : "",
      }))
      .slice(0, 20);

    return data;
  } catch (err) {
    console.log("Error occurred in nykaa scrapper ->", err);
    return [];
  }
};

const relianceProductsScrapper = async (search, sort, filters) => {
  try {
    if (!search) {
      return [];
    }

    const response = await axios
      .get(
        `https://www.reliancedigital.in/search?q=${search}${getUrlParamForSort(
          sort,
          allScrappersList.reliance
        )}`
      )
      .catch((err) => void err);

    const text = response.data;

    const slicedText = text.slice(text.indexOf(`$search`));
    const slicedText2 = slicedText.slice(slicedText.indexOf(`productListData`));
    const slicedText3 = slicedText2.slice(slicedText2.indexOf(`{`));
    const lastPairIndex = getClosingPairIndex(slicedText3);
    const slicedText4 = slicedText3.slice(0, lastPairIndex + 1);

    const parsed = JSON.parse(slicedText4);
    const jsonData = parsed?.results;

    const result = Array.isArray(jsonData)
      ? jsonData
          .map((item) => {
            return {
              id: uuid.v4(),
              link: `https://www.reliancedigital.in${item.url}`,
              title: item?.name,
              price: item?.price?.formattedValue || "",
              image:
                item?.media?.length > 0
                  ? `https://www.reliancedigital.in${item.media[0].thumbnailUrl}`
                  : "",
              ratings: {
                totalReviews: item?.numberOfReviews || 0,
                rating: item?.averageRating || 0,
              },
            };
          })
          .slice(0, 20)
      : [];

    return result;
  } catch (err) {
    console.log("Error occurred in reliance scrapper ->", err);
    return [];
  }
};

const cromaProductsScrapper = async (search, sort, filters) => {
  try {
    if (!search) {
      return [];
    }

    const url = `https://api.croma.com/product/allchannels/v1/search?currentPage=0&query=${search}${getUrlParamForSort(
      sort,
      allScrappersList.croma
    )}&fields=FULL`;

    const response = await requestWithQueueServer(url, 15000);

    let jsonData;
    try {
      jsonData = JSON.parse(response);
    } catch (err) {
      console.log("failed to parse", err);
      jsonData = {};
    }

    const products = jsonData?.products;

    let finalData;
    if (Array.isArray(products)) {
      finalData = products
        .map((item) => {
          return {
            id: uuid.v4(),
            link: `https://www.croma.com${item.url}`,
            title: item?.name,
            price: item?.price?.formattedValue || "",
            image: item?.plpImage || "",
            ratings: {
              totalReviews: item?.finalReviewRatingCount || 0,
              rating: item?.finalReviewRating || 0,
            },
          };
        })
        .slice(0, 20);
    } else finalData = [];

    return finalData;
  } catch (err) {
    console.log("Error occurred in croma scrapper ->", err);
    return [];
  }
};

const tataCliqProductsScrapper = async (search, sort, filters) => {
  try {
    if (!search) {
      return [];
    }

    const url = `https://prodsearch.tatacliq.com/products/mpl/search/?searchText=${search}${
      getUrlParamForSort(sort, allScrappersList.tatacliq) || ":relevance"
    }${getUrlParamForFilters(
      filters,
      allScrappersList.tatacliq
    )}:inStockFlag:true&isKeywordRedirect=false&isKeywordRedirectEnabled=true&channel=WEB&isMDE=true&isTextSearch=false&isFilter=false&qc=false&test=cutsize.sort-inviz&page=0&isSuggested=false&isPwa=true&pageSize=40&typeID=all`;

    const response = await axios.get(url).catch((err) => void err);

    const jsonData = response.data;
    const data = Array.isArray(jsonData?.searchresult)
      ? jsonData.searchresult
          .map((item) => ({
            id: uuid.v4(),
            title: item.productname || "",
            price: item.price?.sellingPrice?.formattedValue || "nan",
            image: item.imageURL,
            brand: item?.brandname || "",
            link: `https://www.tatacliq.com${item.webURL}`,
            ratings: {
              totalReviews: item?.ratingCount || 0,
              rating: item?.averageRating ? item.averageRating.toFixed(1) : 0,
            },
          }))
          .slice(0, 20)
      : [];

    return data;
  } catch (err) {
    console.log("Error occurred in Tata-cliq scrapper ->", err);
    return [];
  }
};

const snapdealProductsScrapper = async (search, sort, filters) => {
  try {
    if (!search) {
      return [];
    }

    const response = await axios
      .get(
        `https://www.snapdeal.com/search?keyword=${search}${getUrlParamForSort(
          sort,
          allScrappersList.snapdeal
        )}${getUrlParamForFilters(filters, allScrappersList.snapdeal)}`
      )
      .catch((err) => void err);

    const text = response.data;
    const root = parse(text);

    const productsElements = Array.from(
      root.querySelectorAll(".product-tuple-listing.js-tuple")
    );
    const result = productsElements.map((item) => {
      let output = {};
      try {
        const imgElem = item.querySelector(".product-tuple-image img");
        const sourceElem = item.querySelector(
          ".product-tuple-image picture source"
        );
        const titleLinkElem = item.querySelector(
          ".product-tuple-description .product-desc-rating a"
        );
        const titleElem = item.querySelector(
          ".product-tuple-description .product-desc-rating .product-title"
        );
        const priceElem = item.querySelector(
          ".product-tuple-description .product-desc-rating .product-price"
        );
        const filledRatingStarElem = item.querySelector(
          ".product-tuple-description .rating-stars .filled-stars"
        );

        let greyStarsWidth = 100;
        let filledStarsWidth =
          filledRatingStarElem?.getAttribute("style") || "";
        filledStarsWidth += "";
        if (filledStarsWidth.includes("width"))
          filledStarsWidth = parseInt(filledStarsWidth.slice(6, 8));
        else filledStarsWidth = 0;

        let rating = 0;
        if (greyStarsWidth && filledStarsWidth) {
          rating = filledStarsWidth / (greyStarsWidth / 5);
        }
        const ratingCountElem = item.querySelector(
          ".product-tuple-description .product-desc-rating .product-rating-count"
        );
        output = {
          title: titleElem?.textContent || "",
          link: titleLinkElem?.getAttribute
            ? titleLinkElem.getAttribute("href")
            : "",
          image:
            imgElem?.src || sourceElem?.getAttribute
              ? sourceElem.getAttribute("srcSet") || ""
              : "",
          price: `₹${
            priceElem?.textContent
              ? priceElem.textContent?.slice(3).trim()
              : "Nan"
          }`,
          ratings: {
            totalReviews: ratingCountElem?.textContent
              ? ratingCountElem.textContent?.slice(1).slice(0, -1)
              : 0,
            rating: rating ? rating.toFixed(1) : 0,
          },
        };
      } catch (err) {
        output = {};
        console.log("error in snapdeal map func->", err);
      }
      return output;
    });

    const finalResult = result
      .map((item) =>
        Object.keys(item).length > 0 ? { ...item, id: uuid.v4() } : {}
      )
      .filter((item) => item.image)
      .slice(0, 20);

    return finalResult;
  } catch (err) {
    console.log("Error occurred in snapdeal scrapper ->", err);
    return [];
  }
};

const shopcluesProductsScrapper = async (search, sort, filters) => {
  try {
    if (!search) {
      return [];
    }

    const response = await axios
      .get(
        `https://bazaar.shopclues.com/search?q=${search}${getUrlParamForFilters(
          filters,
          allScrappersList.shopclues
        )}${getUrlParamForSort(sort, allScrappersList.shopclues)}`,
        {
          waitUntil: "domcontentloaded",
        }
      )
      .catch((err) => void err);

    const text = response.data;
    const root = parse(text);

    const productsElements = Array.from(
      root.querySelectorAll(".row .column.search_blocks")
    );

    const result = productsElements
      .filter((item) => !item.querySelector(".addzone_tag"))
      .map((item) => {
        let output = {};
        try {
          const imgElem = item.querySelector(".img_section img");
          const linkElem = item.querySelector("a");
          const titleElem = item.querySelector("h2");
          const priceElem = item.querySelector(".p_price");
          const containerRatingElem = item.querySelector(".star");
          const childRatingElem = item.querySelector(".star span");

          const containerStarWidth = containerRatingElem?.clientWidth || 0;
          const childStarWidth = childRatingElem?.clientWidth || 0;
          let rating = 0;
          if (containerStarWidth && childStarWidth) {
            rating = childStarWidth / (containerStarWidth / 5);
          }

          output = {
            title: titleElem?.textContent || "",
            link: linkElem?.getAttribute ? linkElem.getAttribute("href") : "",
            image: imgElem?.getAttribute
              ? imgElem.getAttribute("data-img")
              : imgElem?.src || "",
            price: `${
              priceElem?.textContent ? priceElem.textContent?.trim() : "Nan"
            }`,
            ratings: {
              rating: rating || 0,
            },
          };
        } catch (err) {
          output = {};
        }
        return output;
      });

    const finalResult = result
      .map((item) =>
        Object.keys(item).length > 0 ? { ...item, id: uuid.v4() } : {}
      )
      .slice(0, 20);
    return finalResult;
  } catch (err) {
    console.log("Error occurred in shopclues scrapper ->", err);
    return [];
  }
};

const zomatoScrapper = async () => {
  // get loc - https://www.zomato.com/webroutes/location/search?q=sonipat
  // get search result https://www.zomato.com/webroutes/search/autoSuggest?addressId=0&entityId=11398&entityType=city&isOrderLocation=1&cityId=11398&latitude=28.9930822999999900&longitude=77.0100735000000000&entityName=Sonipat&orderLocationName=Sonipat&cityName=Sonipat&countryId=1&countryName=India&displayTitle=Sonipat&o2Serviceable=true&placeId=22324&cellId=4111135597224001036&deliverySubzoneId=22324&placeType=DSZ&placeName=Sonipat&isO2City=true&isO2OnlyCity=true&q=gol&context=delivery
};

const bookingsSuggestions = async (search) => {
  try {
    if (!search) return [];
    const res = await axios
      .post("https://accommodations.booking.com/autocomplete.json", {
        query: search,
        language: "en-gb",
        size: 8,
      })
      .catch((err) => void err);
    const data = res.data?.results;
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => ({
        _id: uuid.v4(),
        label: item.value || item.label,
        lat: item.latitude,
        long: item.longitude,
        destId: item.dest_id,
        destType: item.dest_type,
        from: suggestionScrapperList.bookings,
      }))
      .filter((item) => item.destType !== "hotel");
  } catch (err) {
    console.log("Error occurred in bookingsSuggestions scrapper ->", err);
    return [];
  }
};

const bookingsHotelScrapper = async (options) => {
  try {
    if (
      typeof options !== "object" ||
      !options.adults ||
      !options.rooms ||
      !options.checkInDate ||
      !options.checkOutDate ||
      !options.destType ||
      !options.destId ||
      !options.lat ||
      !options.long
    )
      return [];

    const children =
      Array.isArray(options.children) && options.children.length > 0
        ? options.children.length + "&age=" + options.children.join("&age=")
        : "0";
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

    const reqUrl = `https://www.booking.com/searchresults.en-gb.html?lang=en-gb&sb=1&src_elem=sb&src=searchresults&dest_id=${options.destId}&dest_type=${options.destType}&checkin=${checkInDate}&checkout=${checkOutDate}&group_adults=${options.adults}&no_rooms=${options.rooms}&group_children=${children}&sb_travel_purpose=leisure&selected_currency=INR`;

    const res = await axios
      .get(reqUrl, {
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
          Host: "www.booking.com",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
        },
      })
      .catch((err) => void err);
    const text = res.data;
    const bookingDataIndex = text.indexOf(
      `type=\"application/json\">{\"BasicPropertyData`
    );
    const propertySustainabilityIndex = text.indexOf(
      `type=\"application/json\">{\"PropertySustainabilityFacility`
    );
    const slicedText = text.slice(
      bookingDataIndex > -1 ? bookingDataIndex : propertySustainabilityIndex
    );
    const slicedText2 = slicedText.slice(
      slicedText.indexOf(`{`),
      slicedText.indexOf("</script")
    );
    const parsed = JSON.parse(slicedText2);
    const propertyDataList = {};
    let searchResults;
    Object.keys(parsed).forEach((item) => {
      if (item.includes("BasicPropertyData:"))
        propertyDataList[item] = parsed[item];
      else if (item.includes("ROOT_QUERY")) {
        const searchQueries = parsed[item]?.searchQueries;
        Object.keys(searchQueries).forEach((key) => {
          if (
            key.includes("search") &&
            Array.isArray(searchQueries[key]?.results)
          ) {
            searchResults = searchQueries[key]?.results;
            return;
          }
        });
      }
    });

    const childrenInLink =
      Array.isArray(options.children) && options.children.length > 0
        ? "age=" + options.children.join(";age=")
        : "";
    const childrenInLink2 =
      Array.isArray(options.children) && options.children.length > 0
        ? ";req_age=" + options.children.join(";req_age=")
        : "";
    const data = searchResults
      .map((item) => {
        const propertyDataRef = item.basicPropertyData?.__ref;
        const propertyData = propertyDataList[propertyDataRef];

        const propertyLink = `https://www.booking.com/hotel/in/${
          propertyData.pageName
        }.en-gb.html?${childrenInLink};checkin=${checkInDate};checkout=${checkOutDate};dest_id=${
          options.destId
        };dest_type=${options.destType};group_adults=${
          options.adults
        };group_children=${
          options.children ? options.children.length : 0
        };no_rooms=${options.rooms};req_adults=${
          options.adults
        }${childrenInLink2};req_children=${
          options.children ? options.children.length : 0
        }`;
        const daysStay = Math.round(
          (new Date(options.checkOutDate) - new Date(options.checkInDate)) /
            1000 /
            60 /
            60 /
            24
        );
        const totalPrice =
          item.priceDisplayInfo?.displayPrice.amountPerStay
            ?.amountUnformatted || 0;
        const image = propertyData.photos?.main?.highResUrl
          ? "https://cf.bstatic.com" +
            propertyData.photos?.main?.highResUrl?.relativeUrl
          : "";

        return {
          id: uuid.v4(),
          name: item.displayName?.text || "",
          price: totalPrice / daysStay,
          rating: propertyData.reviews?.totalScore
            ? `${propertyData.reviews?.totalScore}/10`
            : "",
          reviews: propertyData.reviews?.reviewsCount || 0,
          area: item.location?.displayLocation || "",
          address: propertyData.location?.address || "",
          link: propertyLink,
          image,
          images: [image],
          extraInfo: `${
            item.policies?.showFreeCancellation ? "FREE cancellation" : ""
          }${item.policies?.showNoPrepayment ? "@No pre-payment needed" : ""}${
            item.isNewlyOpened ? "@Newly Opened" : ""
          }`.split("@"),
        };
      })
      .filter((item) => item.name && item.price);

    return data;
  } catch (err) {
    console.log("Error occurred in bookingsHotel scrapper ->", err);
    return [];
  }
};

const oyoSuggestions = async (search) => {
  try {
    if (!search) return [];
    const reqUrl = `https://www.oyorooms.com/api/pwa/autocompletenew?query=${search}&region=1&additionalFields=rating,supply,trending,tags,category`;
    const res = await axios.get(reqUrl).catch((err) => console.log(err));
    const data = res.data;
    if (!Array.isArray(data?.responseObject)) return [];

    return data.responseObject
      .map((item) => ({
        _id: uuid.v4(),
        id: item.id,
        locationType: item.locationType,
        label: item.displayName,
        lat: item.centerPoint?.lat,
        long: item.centerPoint?.lng,
        from: suggestionScrapperList.oyo,
      }))
      .filter((item) => item.locationType.toLowerCase() == "city");
  } catch (err) {
    console.log("Error occurred in oyoSuggestions scrapper ->", err);
    return [];
  }
};

const oyoHotelScrapper = async (options) => {
  try {
    if (
      typeof options !== "object" ||
      !options.adults ||
      !options.rooms ||
      !options.checkInDate ||
      !options.checkOutDate ||
      !options.label ||
      !options.locationType ||
      !options.lat ||
      !options.long
    )
      return [];

    const checkInDateArray = new Date(options.checkInDate).toLocaleDateString(
      "en-in"
    );
    const checkOutDateArray = new Date(options.checkOutDate).toLocaleDateString(
      "en-in"
    );
    const reqUrl = `https://www.oyorooms.com/api/pwa/getListingPage?url=${encodeURIComponent(
      `/search?location=${options.label}&latitude=${options.lat}&longitude=${options.long}&searchType=${options.locationType}&checkin=${checkInDateArray}&checkout=${checkOutDateArray}`
    )}&guests=${options.adults}&rooms=${options.rooms}&locale=en`;

    const res = await axios.get(reqUrl).catch((err) => console.log(err));
    const response = res.data;
    const data = response?.searchData?.hotels;

    return data
      .map((item) => {
        const price = item?.category_wise_pricing
          ? Object.values(item.category_wise_pricing)[0]?.final_price || 0
          : 0;
        const link = `https://www.oyorooms.com/${item.id}/?checkin=${checkInDateArray}&checkout=${checkOutDateArray}&rooms=${options.rooms}&guests=${options.adults}`;

        return {
          id: uuid.v4(),
          name: item.name || "",
          price,
          rating: item.ratings?.value ? `${item.ratings?.value}/5` : "",
          reviews: item.ratings?.count || 0,
          area: item.city || "",
          address: item.short_address || item.address || "",
          link,
          image: item.best_image || "",
          images: Array.isArray(item.hotel_images)
            ? item.hotel_images.map((item) => item.url)?.slice(0, 6)
            : [],
          extraInfo: [],
        };
      })
      .filter((item) => item.name && item.price);
  } catch (err) {
    console.log("Error occurred in oyoHotelScrapper scrapper ->", err);
    return [];
  }
};

const goibiboHotelScrapper = async (options) => {
  try {
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
      return [];
    }

    const children =
      Array.isArray(options.children) && options.children.length > 0
        ? options.children.length + "-" + options.children.join("_")
        : "0";
    const checkInDateArray = new Date(options.checkInDate)
      .toLocaleDateString("en-in", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse();
    const checkOutDateArray = new Date(options.checkOutDate)
      .toLocaleDateString("en-in", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse();

    const reqUrl = `https://hermes.goibibo.com/hotels/v13/search/data/v3/${
      options.voyId
    }/${checkInDateArray.join("")}/${checkOutDateArray.join("")}/${
      options.rooms
    }-${
      options.adults
    }-${children}?s=popularity&cur=INR&tmz=-330&entity_type=regions`;

    const res = await requestWithQueueServer(reqUrl, 17000);

    if (!res) return [];
    const text = res;

    const parsedData = JSON.parse(text);

    const data = parsedData?.data;
    const cityInfo = parsedData?.city_meta_info;
    if (!Array.isArray(data)) {
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

    return finalData;
  } catch (err) {
    console.log("Error occurred in goibiboHotelScrapper scrapper ->", err);
    return [];
  }
};

const hotelsDotComSuggestions = async (search) => {
  try {
    if (!search) {
      return [];
    }

    const reqUrl = `https://in.hotels.com/api/v4/typeahead/${search}?browser=Chrome&client=Homepage&dest=true&device=Mobile&expuserid=-1&&format=json&lob=HOTELS&locale=en_IN&maxresults=8&personalize=true`;
    const response = await requestWithQueueServer(reqUrl);

    const parsedData = JSON.parse(response);
    const data = parsedData?.sr;

    if (!Array.isArray(data)) {
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

    return finalData;
  } catch (err) {
    console.log("Error occurred in hotelsDotComSuggestions scrapper ->", err);
    return [];
  }
};

const hotelsDotComHotelScrapper = async (options) => {
  try {
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

    const res = await requestWithQueueServer(
      reqUrl,
      25000,
      undefined,
      undefined,
      undefined,
      {
        startText: "window.__PLUGIN_STATE__ =",
        endText: "</script",
      }
    );
    if (!res) return [];
    const text = res;

    const slicedText2 = text.slice(text.indexOf(`{`));
    const lastPairIndex = getClosingPairIndex(slicedText2);
    const sliceText3 = slicedText2.slice(0, lastPairIndex + 1);
    const unescaped = unescapeJs(sliceText3);
    const parsed = JSON.parse(unescaped);
    const data = parsed?.mobx?.stores?.searchResults?.propertySearchListings;

    if (!Array.isArray(data)) {
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
          area: Array.isArray(model?.headingSection?.messages)
            ? model?.headingSection?.messages[0]?.text
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

    return finalData;
  } catch (err) {
    console.log("Error occurred in hotelsHotelScrapper scrapper ->", err);
    return [];
  }
};

const agodaSuggestions = async (search) => {
  try {
    if (!search) return [];
    const reqUrl = `https://www.agoda.com/api/cronos/search/GetUnifiedSuggestResult/3/16/1/0/en-gb/?searchText=${search}&origin=IN&cid=-1&pageTypeId=1&logTypeId=1&logtime=${new Date()}&isHotelLandSearch=true`;
    const res = await axios.get(reqUrl).catch((err) => console.log(err));
    const data = res.data;
    if (!Array.isArray(data?.ViewModelList)) return [];

    const filteredData = data.ViewModelList.filter(
      (item) =>
        item?.DisplayNames?.CategoryName &&
        (item.DisplayNames?.CategoryName?.toLowerCase() == "area" ||
          item.DisplayNames?.CategoryName?.toLowerCase() == "city")
    );

    return filteredData.map((item) => {
      const resUri = item.ResultUrl;
      let uriDetailsObj = Object.assign(
        ...resUri
          .split("?")[1]
          .split("&")
          .map((item) => ({ [item.split("=")[0]]: item.split("=")[1] }))
      );

      return {
        _id: uuid.v4(),
        ...uriDetailsObj,
        category: item.DisplayNames?.CategoryName,
        label: `${item.DisplayNames.Name}, ${item.DisplayNames.GeoHierarchyName}`,
        lat: item.Latitude,
        long: item.Longtitude,
        cityId: item.CityId,
        objectId: item.ObjectId,
        from: suggestionScrapperList.agoda,
      };
    });
  } catch (err) {
    console.log("Error occurred in agodaSuggestions scrapper ->", err);
    return [];
  }
};

const agodaHotelScrapper = async (options) => {
  try {
    if (
      typeof options !== "object" ||
      !options.adults ||
      !options.rooms ||
      !options.cityId ||
      !options.category ||
      !options.checkInDate ||
      !options.checkOutDate
    )
      return [];

    const checkInDate = new Date(options.checkInDate)
      .toLocaleDateString("en-in", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse();
    // [2022,11,21]
    const reqUrl = `https://www.agoda.com/graphql/search`;

    const isAreaSearch = options.category?.toLowerCase() == "area";
    const body = isAreaSearch
      ? getAgodaAreaSearchObj(options)
      : getAgodaCitySearchObj(options);
    const res = await axios
      .post(reqUrl, body, {
        headers: {
          "ag-debug-override-origin": "IN",
          "ag-language-locale": "en-gb",
        },
      })
      .catch((err) => console.log(err?.message));

    const response = res.data;
    const properties = isAreaSearch
      ? response?.data?.areaSearch?.properties
      : response?.data?.citySearch?.properties;

    if (!Array.isArray(properties)) return [];

    return properties
      .map((item) => {
        let price = Number.MAX_SAFE_INTEGER;
        if (
          Array.isArray(item.pricing?.offers) &&
          item?.pricing?.offers?.length > 0
        ) {
          let currPrice = 0;
          item.pricing.offers.forEach((offer) => {
            if (Array.isArray(offer.roomOffers))
              offer.roomOffers.forEach((obj) => {
                if (Array.isArray(obj.room?.pricing))
                  obj.room.pricing.forEach((p) => {
                    const exclusiveP =
                      p.price?.perRoomPerNight?.exclusive?.display;
                    if (exclusiveP) currPrice = exclusiveP;
                  });
              });
          });

          if (currPrice && currPrice < price) price = currPrice;
        } else
          price = item?.soldOut?.soldOutPrice?.averagePrice
            ? parseInt(item?.soldOut?.soldOutPrice?.averagePrice)
            : 0;

        const link = `https://www.agoda.com/en-gb${
          item.content?.informationSummary?.propertyLinks?.propertyPage
        }?finalPriceView=1&familyMode=false&adults=${options.adults}&children=${
          options.children?.length
        }&childAges=${
          Array.isArray(options.children) ? options.children.join(",") : ""
        }&rooms=${options.rooms}&checkIn=${checkInDate.join(
          "-"
        )}&isCalendarCallout=false&numberOfGuest=0&missingChildAges=false&travellerType=${
          options.children?.length ? "2" : "1"
        }&showReviewSubmissionEntry=false&currencyCode=INR&isFreeOccSearch=false&isCityHaveAsq=false&los=1`;

        return {
          id: uuid.v4(),
          name: item.content?.informationSummary?.displayName || "",
          price,
          rating: item.content?.informationSummary?.rating
            ? `${item.content?.informationSummary?.rating}/5`
            : "",
          reviews: 0,
          area: item.content?.informationSummary?.address?.area?.name || "",
          address: item?.content?.informationSummary?.address
            ? `${item.content.informationSummary?.address?.area?.name}, ${item.content.informationSummary?.address?.city?.name} - ${item.content.informationSummary?.address?.country?.name} `
            : "",
          link,
          image:
            item.content?.images?.hotelImages?.length > 0
              ? "https:" + item.content?.images?.hotelImages[0]?.urls[0]?.value
              : "",
          images: Array.isArray(item.content?.images?.hotelImages)
            ? item.content?.images?.hotelImages
                .map((item) => "https:" + item.urls[0]?.value)
                ?.slice(1, 7)
            : [],
          extraInfo: Array.isArray(
            item?.enrichment?.roomInformation?.facilities
          )
            ? item?.enrichment?.roomInformation?.facilities.map(
                (e) => e.propertyFacilityName
              )
            : [],
        };
      })
      .filter((item) => item.name && item.price);
  } catch (err) {
    console.log("Error occurred in agodaHotelScrapper scrapper ->", err);
    return [];
  }
};

const makeMyTripSuggestions = async (search) => {
  try {
    if (!search) return [];
    const reqUrl = `https://mapi.makemytrip.com/autosuggest/v5/search?exp=3&q=${search}&region=in&language=eng&currency=inr`;
    const res = await axios
      .get(reqUrl)
      .catch((err) => console.log(err?.message));
    const data = res.data;
    if (!Array.isArray(data)) return [];
    return data
      .map((item) => ({
        label: item.displayName,
        lat: item.centre?.lat,
        long: item.centre?.lng,
        id: item.context?.id,
        type: item.type,
        cityCode: item.cityCode,
        countryCode: item.countryCode,
        from: suggestionScrapperList.mmt,
      }))
      .filter(
        (item) =>
          item.type.toLowerCase() == "city" || item.type.toLowerCase() == "area"
      );
  } catch (err) {
    console.log("Error occurred in makeMyTripSuggestions scrapper ->", err);
    return [];
  }
};

// https://www.makemytrip.com/hotels/hotel-listing?checkin=09082022&checkout=09092022&locusId=RGNCR&locusType=region&city=RGNCR&country=IN&searchText=New%20Delhi%20and%20NCR%2C%20India&roomStayQualifier=2e0e&_uCurrency=INR&reference=hotel&type=region

//   data api - https://makemytrip.com/hotels/hotel-listing/?checkin=09062022&checkout=09072022&locusId=RGNCR&locusType=region&city=RGNCR&country=IN&searchText=New%20Delhi%20and%20NCR%2C%20India&roomStayQualifier=2e0e&_uCurrency=INR&reference=hotel&type=region

module.exports = {
  amazonProductsScrapper,
  flipkartProductsScrapper,
  meeshoProductsScrapper,
  jiomartProductsScrapper,
  myntraProductsScrapper,
  ajioProductsScrapper,
  nykaaProductsScrapper,
  relianceProductsScrapper,
  cromaProductsScrapper,
  tataCliqProductsScrapper,
  snapdealProductsScrapper,
  shopcluesProductsScrapper,
  bookingsHotelScrapper,
  bookingsSuggestions,
  oyoSuggestions,
  agodaSuggestions,
  agodaHotelScrapper,
  oyoHotelScrapper,
  goibiboHotelScrapper,
  hotelsDotComHotelScrapper,
  hotelsDotComSuggestions,
  makeMyTripSuggestions,
};
