'use strict';
//created by Hatem Ragap
const express = require('express');
const roomMessageRouter = new express.Router;
const roomMessageController = require('../controller/PublicRoomsMessageController');

roomMessageRouter.post('/fetch_all', roomMessageController.fetchAll);
 
 
module.exports = roomMessageRouter;
