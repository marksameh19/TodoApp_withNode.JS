const mongoose = require("mongoose"),
  passportLocalMongoose = require("passport-local-mongoose");

var taskSchema = require("./task");

var userSchema = new mongoose.Schema({
  username: String,
  password: String,
  posts: [taskSchema],
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
