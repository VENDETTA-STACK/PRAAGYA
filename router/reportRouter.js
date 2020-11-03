"use strict";
//created by Hatem Ragap
const express = require("express");
const reportRouter = new express.Router();
const reportController = require('../controller/reportController');

reportRouter.post("/create",reportController.createReport);
reportRouter.post("/getReport",reportController.getAllReport);

module.exports = reportRouter;