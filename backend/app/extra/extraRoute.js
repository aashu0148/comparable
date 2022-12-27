const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/health", (_req, res) =>
  res.status(200).json({ message: "Hi there! I'm fine and working perfectly" })
);

router.post("/request", async (req, res) => {
  const body = req.body;
  if (!body.type) {
    res.status(400).json({
      success: false,
      message: "type not available",
    });
    return;
  }
  if (!body.key || body.key !== "please") {
    res.status(400).json({
      success: false,
      message: "Unable to verify",
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
  let error;
  try {
    if (isGetReq)
      response = await axios.get(url, config).catch((err) => {
        error = err.toJSON();
        return void err;
      });
    else
      response = await axios.post(url, mainBody, config).catch((err) => {
        error = err.toJSON();
        return void err;
      });
    data = response.data;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error making req",
      config,
      url,
      body: mainBody,
      error: error || err,
      errorString: error ? JSON.stringify(error) + "" : err + "",
    });
    return;
  }

  res.status(200).json({ success: true, data });
});

module.exports = router;
