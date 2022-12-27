require("dotenv").config();
const amqp = require("amqplib/callback_api");
const express = require("express");
const cors = require("cors");

const {
  queueTypes,
  allScrappersList,
  offerScrappersList,
  offerScrapperQueueTypes,
  suggestionScrapperList,
} = require("./constant");
const {
  flipkartProductsScrapper,
  meeshoProductsScrapper,
  ajioProductsScrapper,
  nykaaProductsScrapper,
  relianceProductsScrapper,
  cromaProductsScrapper,
  tataCliqProductsScrapper,
  snapdealProductsScrapper,
  shopcluesProductsScrapper,
  oyoHotelScrapper,
  bookingsHotelScrapper,
  amazonProductsScrapper,
  bookingsSuggestions,
  oyoSuggestions,
  myntraProductsScrapper,
  goibiboHotelScrapper,
  hotelsDotComHotelScrapper,
  agodaHotelScrapper,
  agodaSuggestions,
  hotelsDotComSuggestions,
  makeMyTripSuggestions,
} = require("./scrappers");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/hi", (req, res) => {
  res.status(200).json("Hey");
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
        case suggestionScrapperList.bookings: {
          result = await bookingsSuggestions(search);
          break;
        }
        case suggestionScrapperList.oyo: {
          result = await oyoSuggestions(search);
          break;
        }
        case suggestionScrapperList.agoda: {
          result = await agodaSuggestions(search);
          break;
        }
        case suggestionScrapperList.hotels: {
          result = await hotelsDotComSuggestions(search);
          break;
        }
        case suggestionScrapperList.mmt: {
          result = await makeMyTripSuggestions(search);
          break;
        }
      }
    } else {
      switch (data.scrapper) {
        case allScrappersList.amazon: {
          result = await amazonProductsScrapper(search, sort, filters);
          break;
        }

        case allScrappersList.flipkart: {
          result = await flipkartProductsScrapper(search, sort, filters);
          break;
        }

        case allScrappersList.tatacliq: {
          result = await tataCliqProductsScrapper(search, sort, filters);
          break;
        }

        case allScrappersList.meesho: {
          result = await meeshoProductsScrapper(search, sort, filters);
          break;
        }

        case allScrappersList.ajio: {
          result = await ajioProductsScrapper(search, sort, filters);
          break;
        }

        case allScrappersList.myntra: {
          result = await myntraProductsScrapper(search, sort);
          break;
        }

        case allScrappersList.nykaa: {
          result = await nykaaProductsScrapper(search, sort, filters);
          break;
        }

        case allScrappersList.snapdeal: {
          result = await snapdealProductsScrapper(search, sort, filters);
          break;
        }

        case allScrappersList.shopclues: {
          result = await shopcluesProductsScrapper(search, sort, filters);
          break;
        }

        case allScrappersList.reliance: {
          result = await relianceProductsScrapper(search, sort, filters);
          break;
        }
        case allScrappersList.croma: {
          result = await cromaProductsScrapper(search, sort, filters);
          break;
        }
        case allScrappersList.oyoHotel: {
          result = await oyoHotelScrapper(data.options);
          break;
        }
        case allScrappersList.bookingsHotel: {
          result = await bookingsHotelScrapper(data.options);
          break;
        }
        case allScrappersList.goibiboHotel: {
          result = await goibiboHotelScrapper(data.options);
          break;
        }
        case allScrappersList.hotelsHotel: {
          result = await hotelsDotComHotelScrapper(data.options);
          break;
        }
        case allScrappersList.agodaHotel: {
          result = await agodaHotelScrapper(data.options);
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

  app.listen(process.env.PORT || 5001, () => {
    console.log(`Backend is up at : ${process.env.PORT || 5001}`);
  });

  connection.createChannel((err, channel) => {
    if (err) {
      throw err;
    }
    console.log("channel created ✅");
    const todoQueue = queueTypes.todoBasic;
    const finishedQueue = queueTypes.finishedTask;
    channel.assertQueue(todoQueue);
    channel.prefetch(1);

    for (let i = 0; i < 20; ++i)
      channel.consume(todoQueue, function (receivedData) {
        consumerHandler(channel, receivedData, finishedQueue);
      });
  });
});
