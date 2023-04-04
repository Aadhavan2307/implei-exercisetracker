const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
const e = require('express');
mongoose.connect("mongodb+srv://implei:implei@cluster0.t0da9ru.mongodb.net/impleidb?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

let userSchema = mongoose.Schema(
  {
  username: {
    type: String,
    unique: true,
  }
  },
  { versionKey: false}
)
let User = mongoose.model("User", userSchema);

let exerciseSchema = mongoose.Schema(
  {
    username:String,
    description:String,
    duration:Number,
    date: String,
    userId: String
  },
  { versionKey: false}
)
let Exercise = mongoose.model("Exercise", exerciseSchema);

app.use (bodyParser.urlencoded({extended: false}))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

/*

// User Database
let users = [{username:"Implei", _id:"0", log:[{description:"hello",duration:15,date:"Sun Dec 27 2015"},{description:"bye",duration:15,date:"Fri Dec 25 2015"}]}];

// Create New User Function
app.post("/api/users", function(req, res) {
  let username = req.body.username;
  if (users.find(user => user.username == username)) {
    // If User Already Exists
    let index = users.findIndex(u => u.username == username)
    res.json({ username: users[index].username, _id: index });
  } else {
    // If New User is to be Added
    users.push({username:username, _id:users.length.toString(), log:[]});
    let index = users.findIndex(u => u.username == username)
    res.json({ username: users[index].username, _id: index });
  }
});

// Add Exercise
app.post("/api/users/:_id/exercises", function(req, res) {
  let id = req.params._id;
  let user = users[id];
  let description = req.body.description;
  let duration = parseInt(req.body.duration);
  let date = new Date(req.body.date);
  date = date.toDateString();
  if (date == "Invalid Date"){
    date = new Date().toDateString();
  }
  user.log.push({description:description,duration:duration,date:date});
  res.json({username:user.username,description:description,duration:duration, date:date, _id:id});
});

// Get Queried Exercise Log
app.get("/api/users/:_id/logs", function(req, res) {
  let id = req.params._id;
  let user = users[id];
  let userLog = user.log;
  console.log(req.query.limit);
  console.log(req.query.from);
  if (req.query.from != undefined) {
    fromDate = new Date(req.query.from);
    userLog = userLog.filter(e => new Date(e.date).valueOf() >= fromDate.valueOf());
  }
  if (req.query.to != undefined) {
    toDate = new Date(req.query.to);
    userLog = userLog.filter(e => new Date(e.date).valueOf() <= toDate.valueOf());
  }
  if (req.query.limit != undefined) {
    userLog = userLog.slice(0, parseInt(req.query.limit));
  }
  res.json({username:user.username, count:userLog.length, _id:id,  log:userLog});
});

// Get All Users
app.get("/api/users", function(req, res) {
  let response = [];
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    response.push({username:user.username, _id:user._id});
  }
  res.send(response);
})
*/

app.get("/api/users/:_id/logs", async function(req, res) {
  let {from, to, limit} = req.query
  let _id = req.params._id;
  let foundUser = await User.findById(_id);

  if(!foundUser) {
    res.json({ message: "No user with said ID" })
  }

  let exercises = await Exercise.find({userId:_id });
  exercises = exercises.map(function(exercise){
    return {
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date
    }
  });

  if (from) {
    fromDate = new Date(from);
    fromDate.setDate(fromDate.getDate()-1);
    exercises = exercises.filter(e => new Date(e.date).UTC() >= fromDate.UTC());
  }
  if (to) {
    toDate = new Date(to);
    exercises = exercises.filter(e => new Date(e.date).UTC() <= (toDate.UTC()));
  }
  if (limit) {
    exercises = exercises.splice(0, parseInt(limit));
  }

  res.json({
    username: foundUser.username,
    count: exercises.length,
    _id,
    log: exercises
  });
})

app.post("/api/users", async function(req, res){
  let username = req.body.username;
  let foundUser = await User.findOne({ username })
  if (foundUser) {
    res.json(foundUser);
  } else {
    let user = await User.create({
      username,
    });
  
    res.json(user);
  }
})

app.get("/api/users", async function(req, res){
  res.send(await User.find());
})

app.post("/api/users/:_id/exercises", async function(req, res) {
  let _id = req.params["_id"];
  let { duration, date, description } = req.body;
  console.log(req.params);
  console.log(_id);
  let foundUser = await User.findById(_id);

  if(!foundUser) {
    return res.json({ message: "No user with said ID" })
  }

  if (parseInt(duration) != NaN) {
    if (parseInt(duration) >= 0) {
      duration = parseInt(duration);
    } else {
      return res.json({ "error": "Enter a valid duration" });
    }
  } else {
    return res.json({ "error": "Enter a valid duration" });
  }

  if (!date) {
    date = new Date();
    date.setUTCDate();
    date.setUTCMonth();
    date.setUTCFullYear(); 
  } else {
    date = new Date(date);
  }
  date = date.toDateString();
  let username = foundUser.username;
  let userId = _id

  let exercise = await Exercise.create({
    username, description, duration, date, userId
  })
  
  res.json({username, _id, description, duration, date});
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
