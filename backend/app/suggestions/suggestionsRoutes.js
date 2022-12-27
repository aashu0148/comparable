const express = require("express");

const { checkConnection } = require("../../middleware/connection");
const {
  getHotelSuggestions,
  getEcomerceSuggestions,
} = require("./suggestionsServices");

const router = express.Router();

router.get("/ecomerce", checkConnection, getEcomerceSuggestions);
router.get("/hotel", checkConnection, getHotelSuggestions);

module.exports = router;
