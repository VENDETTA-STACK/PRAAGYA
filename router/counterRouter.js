"use strict";
//created by Hatem Ragap
const express = require("express");
const counterRouter = new express.Router();
const counterController = require('../controller/counterController');

counterRouter.post("/getcounterdata", counterController.counterDataSet);
// counterRouter.post("/delete", counterController.deleteLike);

module.exports = counterRouter;