const mongoose = require("mongoose");

const newUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
});

module.exports = mongoose.model("ExerciseUser", newUserSchema);
