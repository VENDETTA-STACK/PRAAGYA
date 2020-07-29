"use strict";
//created by Hatem Ragap
const express = require("express");
const locationRouter = new express.Router();
const locationController = require("../controller/locationController");

locationRouter.post("/country", locationController.getCountry);
locationRouter.post("/state", locationController.getState);
locationRouter.post("/affiliation", locationController.getAffilation);

module.exports = locationRouter;
