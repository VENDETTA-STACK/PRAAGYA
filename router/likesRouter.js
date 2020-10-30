"use strict";
//created by Hatem Ragap
const express = require("express");
const likesRouter = new express.Router();
const likesController = require('../controller/likesController');

likesRouter.post("/create", likesController.createLike);
likesRouter.post("/delete", likesController.deleteLike);
likesRouter.post("/fetchAllLikes", likesController.fetchLikeData);

module.exports = likesRouter;