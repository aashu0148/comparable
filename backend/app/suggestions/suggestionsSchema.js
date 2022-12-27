const mongoose = require("mongoose");

const SuggestionSchema = mongoose.Schema({
  createdAt: Date,
  updatedAt: Date,
  query: { type: String, required: true },
  data: Object,
  type: String,
  queryCount: Number,
});

const model = mongoose.model("suggestion", SuggestionSchema);

module.exports = model;
