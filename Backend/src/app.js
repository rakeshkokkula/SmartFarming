require("dotenv").config();
// const path = require('path');
const express = require("express");
const http = require("http");

const bodyParser = require("body-parser");
// const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport");
const app = express();
const server = http.createServer(app);
const socketio = require("socket.io")(server);
require("./routes/sockets/socket")(socketio);

app.use(passport.initialize());
const cors = require("cors");

// const corsOptions = {
//   //origin: "http://15.206.93.252",
//   origin: "http://192.168.0.9:8002",
//   optionsSuccessStatus: 200,
//   credentials: true,
// };

const authRoute = require("./routes/auth")(passport);
const rideRoute = require("./routes/ride/ride")(socketio);

//app.use(cors());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB CONNECTED");
  })
  .catch(console.log("DB NOT CONNECTED"));

//myRoutes
app.use("/", authRoute);
app.use("/ride", rideRoute);
app.get("/", (req, res) => {
  res.send("Welcome To Pooliong API");
});

// //////////////////////////////Port////////////////////////
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
server.listen(port, function () {
  console.log("Server started on port " + port);
});
