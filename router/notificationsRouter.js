"use strict";
//created by Hatem Ragap
const express = require("express");
const notificationsRouter = new express.Router();
const notificationsController = require('../controller/notificationController');


notificationsRouter.post("/fetch_all", notificationsController.getNotifications);
notificationsRouter.post("/deleteAll", notificationsController.deleteAll);


module.exports = notificationsRouter;
