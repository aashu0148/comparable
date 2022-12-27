const mongoose = require("mongoose");

const analyticsSchema = mongoose.Schema({
  createdAt: Date,
  updatedAt: Date,
  apiCallCount: Object,
  linkClickCount: Object,
  createdDate: String,
});

const model = mongoose.model("Analytics", analyticsSchema);

module.exports = model;
