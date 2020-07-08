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
const app = express();
// adding Helmet to enhance your API's security
app.use(helmet());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));

app.use(express.json());

//to send data from post man and any front end
app.use(bodyParser.urlencoded({ extended: false }));

// public place for img
app.use("/uploads", express.static("uploads"));

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

module.exports = app;
