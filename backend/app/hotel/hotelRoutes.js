const express = require("express");

const { checkConnection } = require("../../middleware/connection");
const { getHotels } = require("./hotelServices");

const router = express.Router();

router.post("/", checkConnection, getHotels);

module.exports = router;
