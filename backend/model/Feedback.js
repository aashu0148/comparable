const mongoose = require("mongoose");

const feedbackSchema = mongoose.Schema({
  createdAt: Date,
  name: String,
  feedback: String,
  email: String,
  priority: Number,
});

const model = mongoose.model("Feedback", feedbackSchema);

module.exports = model;
