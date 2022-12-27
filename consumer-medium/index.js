// To install puppeteer on digitalocean droplet run this - sudo apt install libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3-dev libxss-dev
// After this relogin into the droplet
// I have also tried this command - sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

require("dotenv").config();
const amqp = require("amqplib/callback_api");
const express = require("express");
const cors = require("cors");

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
const puppeteer = require("puppeteer-extra");
const { executablePath } = require("puppeteer");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const {
  queueTypes,
  allScrappersList,
  offerScrappersList,
  offerScrapperQueueTypes,
  suggestionScrapperList,
} = require("./constant");
const {
  amazonProductsScrapper,
  myntraProductsScrapper,
  jiomartProductsScrapper,
  goibiboSuggestions,
  hotelsDotComSuggestions,
  meeshoProductsScrapper,
  hotelsDotComHotelScrapper,
  goibiboHotelScrapper,
  makeMyTripHotelScrapper,
} = require("./scrappers");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let browser;

const assignPage = async (blockImages = false, headers = {}) => {
  let page = await browser.newPage();

  // to prevent blocking by some browser due to headless user agent - add user agent from normal chrome browser
  const config = {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36",
    ...headers,
  };

  await page.setExtraHTTPHeaders(config);
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

const handleExtraReq = async (page, url) => {
  let output = "";
  try {
    if (!page) {
      await page.close();
      return output;
    }
    const response = await page
      .goto(url, {
        waitUntil: "domcontentloaded",
      })
      .catch((err) => console.log(err));
    let reqHeaders;
    try {
      reqHeaders = await response?.request()?.headers();
    } catch (_err) {
      reqHeaders = "";
    }

    const bodyHTML = await page.evaluate(
      () => document.documentElement.outerHTML
    );

    await page.close();
    output = {
      reqHeaders,
      out: bodyHTML + "",
    };
  } catch (err) {
    await page.close();
    console.log("Error occurred in extra request scrapper ->", err);
    output = "";
  }

  return output;
};

app.use("/hi", (req, res) => {
  res.status(200).json("Hey");
});

app.post("/extra/request", async (req, res) => {
  const body = req.body;
  if (!body.url) {
    res.status(400).json({
      success: false,
      message: "url not available",
    });
    return;
  }
  const headers = body.headers || {};
  const url = body.url;

  const page = await assignPage(true, headers);
  const out = await handleExtraReq(page, url);

  res.status(200).json({ success: true, output: out });
});

const handleOffers = (channel, data, result) => {
  let offerScrapperLinkSize = 9;

  const heavyQueue = offerScrapperQueueTypes[data.scrapper];
  if (!heavyQueue) return;
  channel.assertQueue(heavyQueue, {
    durable: true,
  });

  const offerScrapperResults = result
    .map((item) => ({ link: item.link, id: item.id }))
    .slice(0, offerScrapperLinkSize);

  channel.sendToQueue(
    heavyQueue,
    Buffer.from(
      "" +
        JSON.stringify({
          ...data,
          ids: offerScrapperResults.map((item) => item.id),
          links: offerScrapperResults.map((item) => item.link),
        })
    ),
    {
      persistent: true,
    }
  );
};

const consumerHandler = async (channel, receivedData, finishedQueue) => {
  const stringified = receivedData.content.toString();
  const data = JSON.parse(stringified || "");
  let result = [];

  if (data?.scrapper) {
    const sort = data.sort;
    const filters = data.filters;
    const search = data.search || "";
    console.log("🟡 processing for ->", data.scrapper);

    if (data?.isSuggestion) {
      switch (data.scrapper) {
        case suggestionScrapperList.goibibo: {
          result = await goibiboSuggestions(search, assignPage);
          break;
        }
        case suggestionScrapperList.hotels: {
          result = await hotelsDotComSuggestions(search, assignPage);
          break;
        }
      }
    } else {
      switch (data.scrapper) {
        case allScrappersList.amazon: {
          result = await amazonProductsScrapper(
            search,
            assignPage,
            sort,
            filters
          );
          break;
        }
        case allScrappersList.myntra: {
          result = await myntraProductsScrapper(search, assignPage);
          break;
        }
        case allScrappersList.meesho: {
          result = await meeshoProductsScrapper(search, assignPage);
          break;
        }
        case allScrappersList.jiomart: {
          result = await jiomartProductsScrapper(search, assignPage);
          break;
        }
        case allScrappersList.goibiboHotel: {
          result = await goibiboHotelScrapper(data.options, assignPage);
          break;
        }
        case allScrappersList.hotelsHotel: {
          result = await hotelsDotComHotelScrapper(data.options, assignPage);
          break;
        }
        case allScrappersList.mmtHotel: {
          result = await makeMyTripHotelScrapper(data.options, assignPage);
          break;
        }
      }
    }
    console.log(`✅ processed for -> ${data.scrapper}`);
  }

  if (Array.isArray(result))
    result.forEach((item) => {
      let price = item.price + "";
      price = (price.match(/[0123456789.]/g) || []).join("");
      price = parseFloat(price || 0) || 0;
      item.price = price;
    });

  channel.assertQueue(finishedQueue, {
    durable: true,
  });
  channel.sendToQueue(
    finishedQueue,
    Buffer.from("" + JSON.stringify({ ...data, result })),
    {
      persistent: true,
    }
  );

  if (
    data.scrapper &&
    data?.fetchOffers &&
    offerScrappersList.some((item) => item == data.scrapper) &&
    Array.isArray(result)
  ) {
    handleOffers(channel, data, result);
  }

  channel.ack(receivedData);
};

amqp.connect(process.env.RABBIT_MQ_URL, async function (error0, connection) {
  if (error0) {
    throw error0;
  }

  app.listen(process.env.PORT || 5002, () => {
    console.log(`Backend is up at : ${process.env.PORT || 5002}`);
  });

  browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: executablePath(),
  });
  console.log("Browser established");

  connection.createChannel((err, channel) => {
    if (err) {
      throw err;
    }
    console.log("channel created ✅");
    const todoQueue = queueTypes.todoMedium;
    const finishedQueue = queueTypes.finishedTask;
    channel.assertQueue(todoQueue);
    channel.prefetch(1);

    for (let i = 0; i < 8; ++i)
      channel.consume(todoQueue, function (receivedData) {
        consumerHandler(channel, receivedData, finishedQueue);
      });
  });
});
