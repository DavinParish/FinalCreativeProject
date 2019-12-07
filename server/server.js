const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('../public'));

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/ideas', {
  useNewUrlParser: true
});

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const ideas = require("./ideas.js");
app.use("/api/ideas", ideas);
const users = require("./users.js");
app.use("/api/users", users);

app.listen(4210, () => console.log('Server listening on port 4210!'));