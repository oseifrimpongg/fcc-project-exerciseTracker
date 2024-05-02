const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

// Database Connection
const ExercisePerson = require("./models/newUserSchema");
const ExerciseDone = require("./models/exerciseSchema");
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGOURL)
  .then(() => console.log("Connected to Database"));

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", async (req, res) => {
  const username = req.body.username;
  const newUser = await new ExercisePerson({
    username: username,
  }).save();

  res.json({
    _id: newUser._id,
    username: newUser.username,
  });
});

app.get("/api/users", async (req, res) => {
  const users = await ExercisePerson.find();

  res.json(
    users.map((user) => ({
      _id: user._id,
      username: user.username,
    }))
  );
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const userid = req.params._id;
  const exercise = req.body;
  const existingUser = await ExercisePerson.findById(userid);

  const userExercise = await new ExerciseDone({
    userid: userid,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date || new Date(),
  }).save();

  res.json({
    _id: userid,
    username: existingUser.username,
    description: userExercise.description,
    duration: userExercise.duration,
    date: userExercise.date.toDateString(),
  });
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const userid = req.params._id;
  const user = await ExercisePerson.findById(userid);
  const exercises = await ExerciseDone.find({ userid: userid });

  const { from, to, limit } = req.query;
  const filter = {};
  filter.userid = userid;
  if (req.query.from || req.query.to) filter.date = {};
  if (req.query.from) filter.date.$gte = new Date(req.query.from);
  if (req.query.to) filter.date.$lte = new Date(req.query.to);

  console.log(filter);
  const matchingExercises = await ExerciseDone.find(filter).limit(
    +limit ?? 500
  );
  res.json({
    username: user.username,
    count: matchingExercises.length,
    _id: userid,
    log: matchingExercises.map((exercise) => ({
      _id: exercise._id,
      duration: exercise.duration,
      description: exercise.description,
      date: exercise.date.toDateString(),
      userid: exercise.userid,
    })),
  });
});

// Initiaate Server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
