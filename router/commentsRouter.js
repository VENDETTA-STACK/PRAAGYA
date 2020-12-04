"use strict";
//created by Hatem Ragap
const express = require("express");
const commentRouter = new express.Router();
const commentController = require('../controller/commentController');

commentRouter.post("/create", commentController.createComment);
commentRouter.post("/delete", commentController.deleteComment);
commentRouter.post("/fetch_all", commentController.getComments);
commentRouter.post("/fetch_all_comments", commentController.getAllCommentsData);
commentRouter.post("/deleteAll", commentController.deleteAll);

module.exports = commentRouter;