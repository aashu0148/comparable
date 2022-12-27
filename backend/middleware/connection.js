const { statusCodes } = require("../constant.js");

const checkConnection = (req, res, next) => {
  try {
    const connectionId = req.headers.authorization;
    const channel = req.mainChannel;
    if (!connectionId) {
      res.status(statusCodes.missingInfo).json({
        message: "Connection id not found",
      });
      return;
    }
    if (!channel) {
      res.status(statusCodes.somethingWentWrong).json({
        message: "Unable to establish channel. Please try later",
      });
      return;
    }
    const url = req.originalUrl;
    const isSuggestApi = url.startsWith("/suggest");

    const activeConnections = req.activeConnections;
    const activeConnectionIndex = activeConnections.findIndex(
      (item) => item.connectionId === connectionId
    );
    if (activeConnectionIndex < 0) {
      res.status(statusCodes.missingInfo).json({
        message: "Connection not present",
      });
      return;
    }

    if (activeConnections[activeConnectionIndex].reqNumber > 30) {
      res.status(statusCodes.limitReached).json({
        message: "Max req limit reached.",
      });
      return;
    }
    if (!isSuggestApi) req.incrementConnectionReqNumber(activeConnectionIndex);

    req.activeConnection = { ...activeConnections[activeConnectionIndex] };

    next();
  } catch (err) {
    res.status(statusCodes.somethingWentWrong).json({
      message:
        "Unexpected error occurred on server while validating connection.",
      error: err,
    });
  }
};

const passConnectionDetails = (details) => {
  const {
    req,
    res,
    next,
    activeConnections,
    channel,
    requestCache: caches,
    globalState,
    handleFinalSuggestionsData: handleSuggestionsData,
  } = details;
  try {
    if (!Array.isArray(activeConnections)) {
      res.status(statusCodes.somethingWentWrong).json({
        message:
          "Unexpected error occurred on server. Please have some patience we are working on it.",
      });
      return;
    }

    const tempConnections = [];
    activeConnections.forEach((item) => tempConnections.push({ ...item }));
    req.activeConnections = tempConnections;
    const tempCache = [];
    caches.forEach((item) => tempCache.push({ ...item }));
    req.requestCache = tempCache;
    req.removeCache = (index = -1) => {
      if (index < 0) return;
      caches.splice(index, 1);
    };
    req.incrementConnectionReqNumber = (index) => {
      activeConnections[index].reqNumber += 1;
    };

    req.mainChannel = channel;
    req.handleSuggestionsData = handleSuggestionsData;
    req.globalState = { ...globalState };

    next();
  } catch (err) {
    res.status(statusCodes.somethingWentWrong).json({
      message:
        "Unexpected error occurred on server. Please have some patience we are working on it.",
      error: err,
    });
  }
};

module.exports = { checkConnection, passConnectionDetails };
