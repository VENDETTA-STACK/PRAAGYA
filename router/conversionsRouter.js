"use strict";
//created by Hatem Ragap
const express = require("express");
const conversionsRouter = new express.Router();
const conversionsController = require('../controller/conversionsController');

conversionsRouter.post("/create", conversionsController.createChatRoom);
conversionsRouter.post("/getUserChats", conversionsController.getUserChats);


module.exports = conversionsRouter;