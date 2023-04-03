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
let users = [{Username:"Implei", Log:[{description:"hello",duration:15,date:"Fri Dec 25 2015"},{description:"bye",duration:15,date:"Fri Dec 25 2015"}]}];

// Create New User Function
app.post("/api/users", function(req, res) {
  let username = req.body.username;
  if (users.find(user => user.Username == username)) {
    // If User Already Exists
    let index = users.findIndex(u => u.Username == username)
    res.json({ "username": users[index].Username, "_id": index });
  } else {
    // If New User is to be Added
    users.push({Username:username, Log:[]});
    let index = users.findIndex(u => u.Username == username)
    res.json({ "username": users[index].Username, "id": index });
  }
});

// Add Exercise
app.post("/api/users/:_id/exercises", function(req, res) {
  let id = req.params._id;
  let user = users[id];
  let description = req.body.description;
  let duration = req.body.duration;
  let date = new Date(req.body.date);
  date = date.toDateString();
  user.Log.push({description:description,duration:duration,date:date});
  res.json({"_id":id,"username":user.Username,"date":date,"duration":duration,"description":description});
});

// Get Exercise Log
app.get("/api/users/:_id/logs", function(req, res) {
  let id = req.params._id;
  let user = users[id];
  res.json({"_id":id, "username":user.Username, "count":user.Log.length, "log":user.Log});
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
