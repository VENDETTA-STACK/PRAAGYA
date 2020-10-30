"use strict";
//created by Hatem Ragap
const cors = require("cors");
const helmet = require("helmet"); // helmet morgan body-parser mongoose
const morgan = require("morgan");
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./router/userRouter");
const postRouter = require("./router/postRouter.js");
const likesRouter = require("./router/likesRouter");
const conversionsRouter = require("./router/conversionsRouter");
const messageRouter = require("./router/messagesRouter");
const commentRouter = require("./router/commentsRouter");
const notificationsRouter = require("./router/notificationsRouter");
const publicRoomRouter = require("./router/publicRoomsRouter");
const publicRoomMessagesRouter = require("./router/publicRoomMessagesRouter");
const locationRouter = require("./router/locationRouter");
const counterRouter = require("./router/counterRouter");
const app = express();
// adding Helmet to enhance your API's security
app.use(helmet());

// enabling CORS for all requests
app.use(cors());
console.log("caasd");

// set up a route to redirect http to https
app.get('*', function(req, res) {  
    res.redirect('http://' + req.headers.host + req.url);

    // Or, if you don't want to automatically detect the domain name from the request header, you can hard code it:
    // res.redirect('https://example.com' + req.url);
})

// app.use(function(req, res, next) {
//       if ((req.get('X-Forwarded-Proto') !== 'https')) {
//         res.redirect('https://' + req.get('Host') + req.url);
//       } else
//         next();
//     });

// app.use(function(req, res, next) {
//   if (req.secure){
//     return next();
//   }
//   res.redirect("https://" + req.headers.host + req.url);
// });

// adding morgan to log HTTP requests
app.use(morgan("combined"));

app.use(express.json());

//to send data from post man and any front end
app.use(bodyParser.urlencoded({ extended: false }));

// public place for img
app.use("/api/uploads", express.static("uploads"));

// parse an HTML body into a string
app.use(bodyParser.json());
const serviceAccount = require("./vchatappmongo-firebase-adminsdk-r81s8-00cd33ab16.json");
var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pragya-principal.firebaseio.com",
});

// for local
const mongoUrlLocal =
  "mongodb+srv://root:admin@cluster0.tvuul.mongodb.net/cluster0?retryWrites=true&w=majority";
mongoose
  .connect(mongoUrlLocal, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to data base");
  });

// static end point for user api
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/conversions", conversionsRouter);
app.use("/api/like", likesRouter);
app.use("/api/message", messageRouter);
app.use("/api/comment", commentRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/rooms", publicRoomRouter);
app.use("/api/roomsMessages", publicRoomMessagesRouter);
app.use("/api/location", locationRouter);
app.use("/api/counter",counterRouter);

module.exports = app;
