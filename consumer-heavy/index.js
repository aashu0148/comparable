require("dotenv").config();
const amqp = require("amqplib/callback_api");
const express = require("express");
const cors = require("cors");

const { queueTypes, allScrappersList } = require("./constant.js");
const {
  flipkartProductOfferScrapper,
  tatacliqProductOfferScrapper,
  relianceProductOfferScrapper,
  amazonProductOfferScrapper,
  cromaProductOfferScrapper,
} = require("./scrappers");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/hi", (req, res) => {
  res.status(200).json("Hey");
});

const consumerHandler = async (channel, receivedData, finishedQueue) => {
  const stringified = receivedData.content.toString();
  const data = JSON.parse(stringified || "");
  let result = [];
  const links = data.links || "";
  const ids = data.ids || "";

  if (
    data?.scrapper &&
    Array.isArray(links) &&
    Array.isArray(ids) &&
    links.length > 0 &&
    links.length == ids.length
  ) {
    console.log("🟡 processing for ->", data.scrapper);
    switch (data.scrapper) {
      case allScrappersList.amazon: {
        result = await Promise.all(
          links.map(async (item) => await amazonProductOfferScrapper(item))
        );
        break;
      }
      case allScrappersList.flipkart: {
        result = await Promise.all(
          links.map(async (item) => await flipkartProductOfferScrapper(item))
        );
        break;
      }
      case allScrappersList.tatacliq: {
        result = await Promise.all(
          links.map(async (item) => await tatacliqProductOfferScrapper(item))
        );
        break;
      }
      case allScrappersList.reliance: {
        result = await Promise.all(
          links.map(async (item) => await relianceProductOfferScrapper(item))
        );
        break;
      }
      case allScrappersList.croma: {
        result = await Promise.all(
          links.map(
            async (item) =>
              await cromaProductOfferScrapper(
                item,
                data.globalState?.cromaProgramId
              )
          )
        );
        break;
      }
    }
    console.log(`✅ processed for -> ${data.scrapper}`);
    result = result.map((item, index) => ({ ...item, id: ids[index] }));
  }

  channel.assertQueue(finishedQueue, {
    durable: true,
  });
  channel.sendToQueue(
    finishedQueue,
    Buffer.from(
      "" + JSON.stringify({ ...data, isOfferDetails: true, offers: result })
    ),
    {
      persistent: true,
    }
  );

  channel.ack(receivedData);
};

amqp.connect(process.env.RABBIT_MQ_URL, async function (error0, connection) {
  if (error0) {
    throw error0;
  }

  app.listen(process.env.PORT || 5003, () => {
    console.log(`Backend is up at : ${process.env.PORT || 5003}`);
  });

  connection.createChannel((err, channel) => {
    if (err) {
      throw err;
    }
    console.log("channel created ✅");
    const todoQueue = queueTypes.todoHeavy;
    const finishedQueue = queueTypes.finishedTask;
    channel.assertQueue(todoQueue);
    channel.prefetch(1);

    for (let i = 0; i < 4; ++i)
      channel.consume(todoQueue, function (receivedData) {
        consumerHandler(channel, receivedData, finishedQueue);
      });
  });
});
