const mongoose = require("mongoose");

module.exports = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  title: String,
  body: String,
});
