const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
mongoose.connect("mongodb+srv://implei:implei@cluster0.t0da9ru.mongodb.net/impleidb?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

app.use (bodyParser.urlencoded({extended: false}))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// User Database
let users = [{username:"Implei", _id:"0", log:[{description:"hello",duration:15,date:"Sun Dec 27 2015"},{description:"bye",duration:15,date:"Fri Dec 25 2015"}]}];

// Create New User Function
app.post("/api/users", function(req, res) {
  let username = req.body.username;
  if (users.find(user => user.username == username)) {
    // If User Already Exists
    let index = users.findIndex(u => u.username == username)
    res.json({ "username": users[index].username, "_id": index });
  } else {
    // If New User is to be Added
    users.push({username:username, _id:users.length.toString(), log:[]});
    let index = users.findIndex(u => u.username == username)
    res.json({ "username": users[index].username, "_id": index });
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
  res.json({"username":user.username,"description":description,"duration":duration, "date":date, "_id":id});
});

/*/ Get Exercise log
app.get("/api/users/:_id/logs", function(req, res) {
  let id = req.params._id;
  let user = users[id];
  res.json({"_id":id, "username":user.username, "count":user.log.length, "log":user.log});
});*/

// Get Queried Exercise Log
app.get("/api/users/:_id/logs", function(req, res) {
  let id = req.params._id;
  let user = users[id];
  let userLog = user.log;
  console.log(req.query.limit);
  console.log(req.query.from);
  if (req.query.limit != undefined) {
    userLog = userLog.slice(0, parseInt(req.query.limit));
  }
  if (req.query.from != undefined) {
    fromDate = new Date(req.query.from);
    userLog = userLog.filter(e => new Date(e.date).valueOf() >= fromDate.valueOf());
  }
  if (req.query.to != undefined) {
    toDate = new Date(req.query.to);
    userLog = userLog.filter(e => new Date(e.date).valueOf() <= toDate.valueOf());
  }
  res.json({"username":user.username, "count":userLog.length, "_id":id,  "log":userLog});
});

// Get All Users
app.get("/api/users", function(req, res) {
  let response = [];
  for (let i = 0; i < users.length; i++) {
    let user = users[i];
    response.push({"username":user.username, "_id":user._id});
  }
  res.send(response);
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
