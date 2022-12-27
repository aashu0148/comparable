const express = require("express");

const { computeEcomerce } = require("./ecomerceServices");
const { checkConnection } = require("../../middleware/connection");

const router = express.Router();

router.post("/", checkConnection, computeEcomerce);

module.exports = router;
