"use strict";
//created by Hatem Ragap
const express = require("express");
const locationRouter = new express.Router();
const locationController = require("../controller/locationController");

locationRouter.post("/country", locationController.getCountry);
locationRouter.post("/insertcountry", locationController.insertCountry);
locationRouter.post("/state", locationController.getState);
locationRouter.post("/city", locationController.getCity);

module.exports = locationRouter;
