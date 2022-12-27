require("dotenv").config();
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const uuid = require("uuid");
const cryptoJs = require("crypto-js");
const { getChannel } = require("./rabbitMqHandler.js");
const { queueTypes } = require("./constant.js");
const { passConnectionDetails } = require("./middleware/connection.js");
const ecomerceRoute = require("./app/ecomerce/ecomerceRoutes.js");
const suggestionsRoute = require("./app/suggestions/suggestionsRoutes.js");
const SuggestionModel = require("./app/suggestions/suggestionsSchema.js");
const hotelsRoute = require("./app/hotel/hotelRoutes.js");
const extraRoute = require("./app/extra/extraRoute.js");
const computeRoute = require("./routes/compute.js");
const analyticRoute = require("./routes/analytic.js");
const feedbackRoute = require("./routes/feedback.js");
const adminRoute = require("./routes/admin.js");
const { initaliseDb } = require("./util.js");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = require("http").Server(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

const activeConnections = [];
let requestCache = [];
const globalState = {
  cromaProgramId: "01eae2ec-0576-1000-bbea-86e16dcb4b79",
};

let channel;

const handleFinalComputedData = (data) => {
  const cacheIndex = requestCache.findIndex(
    (item) => item.search == data.search
  );
  if (cacheIndex > -1) {
    if (!requestCache[cacheIndex].data[data.scrapper]?.result)
      requestCache[cacheIndex].count += 1;

    requestCache[cacheIndex].data[data.scrapper] = {
      result: data?.isOfferDetails
        ? requestCache[cacheIndex].data[data.scrapper]?.result
        : data.result,
      offers: data?.isOfferDetails
        ? data.offers
        : requestCache[cacheIndex].data[data.scrapper]?.offers,
    };

    const cache = requestCache[cacheIndex];
    requestCache.splice(cacheIndex, 1);
    requestCache.push(cache);
  } else {
    if (requestCache.length > 999) requestCache = requestCache.slice(-999);

    requestCache.push({
      count: 1,
      search: data.search,
      data: {
        [data.scrapper]: {
          result: data?.isOfferDetails ? undefined : data.result,
          offers: data?.isOfferDetails ? data.offers : undefined,
          options: data?.options ? data.options : undefined,
        },
      },
      date: Date.now(),
    });
  }

  io.of(`/${data.connectionId}`).emit("data", {
    responseKey: data?.responseKey,
    result: data.result,
    from: data.scrapper,
    search: data.search,
    offers: data?.offers ? data.offers : undefined,
    isOfferDetails: data?.isOfferDetails ? data.isOfferDetails : undefined,
  });
};

const handleFinalSuggestionsData = async (
  data,
  updateToDb = false,
  count = 1
) => {
  if (data.result?.length > 0 && data.search) {
    if (updateToDb) {
      SuggestionModel.updateOne(
        { query: data.search, type: "hotel" },
        { $set: { queryCount: count } }
      )
        .then(() =>
          console.log(
            "Suggestion count updated in db",
            "for",
            data.search,
            "in",
            data.scrapper
          )
        )
        .catch((err) => console.log("Error saving suggestions in DB", err));
    } else {
      const existing = await SuggestionModel.findOne({
        query: data.search,
        type: "hotel",
      });
      if (existing && existing?.data && existing?.queryCount) {
        SuggestionModel.updateOne(
          { query: data.search, type: "hotel" },
          {
            $set: {
              data: {
                ...existing.data,
                [data.scrapper]: data.result,
                queryCount: existing.queryCount + 1,
              },
            },
          }
        )
          .then(() =>
            console.log(
              "Suggestion count updated in db",
              "for",
              data.search,
              "in",
              data.scrapper
            )
          )
          .catch((err) => console.log("Error saving suggestions in DB", err));
      } else {
        const newSuggestionToDb = new SuggestionModel({
          type: "hotel",
          query: data.search,
          data: { [data.scrapper]: data.result },
          queryCount: 1,
        });

        newSuggestionToDb
          .save()
          .then(() =>
            console.log(
              "Suggestion ",
              data.search,
              " saved in db",
              "for",
              data.scrapper
            )
          )
          .catch((err) => console.log("Error saving suggestions in DB", err));
      }
    }
  }

  io.of(`/${data.connectionId}`).emit("suggestion", {
    responseKey: data?.responseKey,
    result: data.result,
    from: data.scrapper,
    search: data.search,
  });
};

const consumerHandler = async (receivedData) => {
  const stringified = receivedData.content.toString();
  const data = JSON.parse(stringified || "");

  const connectionId = data.connectionId;
  channel.ack(receivedData);
  if (!connectionId) return;
  const isActiveConnection = activeConnections.some(
    (item) => item.connectionId === connectionId
  );

  if (!isActiveConnection) return;

  if (data.isSuggestion) handleFinalSuggestionsData(data);
  else handleFinalComputedData(data);
};

(async () => {
  try {
    channel = await getChannel();
  } catch (err) {
    throw err;
  }

  const finishedTaskQueue = queueTypes.finishedTask;
  channel.assertQueue(finishedTaskQueue);
  channel.prefetch(1);

  channel.consume(finishedTaskQueue, consumerHandler);
  channel.consume(finishedTaskQueue, consumerHandler);
})();

app.use((req, res, next) =>
  passConnectionDetails({
    req,
    res,
    next,
    channel,
    requestCache,
    globalState,
    activeConnections,
    handleFinalSuggestionsData,
  })
);

app.use("/suggest", suggestionsRoute);
app.use(
  "/ecomerce",
  (req, _res, next) => {
    const query = req.query.search;
    if (!query) next();
    else {
      req.query.search = query.trim();
      next();
    }
  },
  ecomerceRoute
);
app.use(
  "/hotel",
  (req, _res, next) => {
    const query = req.query.search;
    if (!query) next();
    else {
      req.query.search = query.trim();
      next();
    }
  },
  hotelsRoute
);
app.use(
  "/compute",
  (req, _res, next) => {
    const query = req.query.search;
    if (!query) next();
    else {
      req.query.search = query.trim();
      next();
    }
  },
  computeRoute
);
app.use("/extra", extraRoute);
app.use("/analytic", analyticRoute);
app.use("/feedback", feedbackRoute);
app.use("/admin", adminRoute);

app.get("/connect", async (req, res) => {
  const key = process.env.PRIVATE_KEY;
  const encryptedData = req.headers["authorization"];
  const url = req.headers.backendorigin + req.originalUrl;

  let userId, name;
  try {
    const bytes = cryptoJs.AES.decrypt(encryptedData, key);
    const decryptedData = JSON.parse(bytes.toString(cryptoJs.enc.Utf8));

    if (decryptedData?.text === url.slice(-10)) {
      userId = decryptedData?.id;
      name = decryptedData?.name || "";
    }
  } catch (err) {
    //nothing
  }

  if (!userId) {
    res.status(404).json({
      message: "Make request from comparable app/website only.",
    });
    return;
  }
  const activeConnection = activeConnections.find(
    (item) => item.userId === userId
  );

  if (activeConnection) {
    res.status(200).json({
      data: {
        connectionId: activeConnection.connectionId,
        userId: activeConnection.userId,
      },
    });
    return;
  }

  const connectionId = uuid.v4();

  const connection = {
    connectionId: connectionId,
    userId,
    name,
    reqNumber: 0,
  };

  // doing this to wake up consumer servers
  try {
    const serverApis = ["https://stage-consumer-2.herokuapp.com/hi"];
    serverApis.forEach((item) => axios.get(item)?.catch((err) => void err));
  } catch (err) {
    console.log(err.message);
    // nothing
  }

  io.of(`/${connectionId}`).on("connection", (socket) => {
    const isConnectionPresent = activeConnections.some(
      (item) => item.connectionId === connectionId
    );
    if (!isConnectionPresent) activeConnections.push(connection);

    socket.on("disconnect", () => {
      const index = activeConnections.findIndex(
        (item) => item.connectionId === connectionId
      );
      if (index > -1) activeConnections.splice(index, 1);
    });
  });

  res.status(200).json({
    data: {
      connectionId: connection.connectionId,
      userId: connection.userId,
    },
  });
});

initaliseDb();

server.listen(process.env.PORT || 5000, () => {
  console.log(`Backend is up at : ${process.env.PORT || 5000}`);
});
