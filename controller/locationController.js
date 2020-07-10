"use strict";

const { countrySchemaModel } = require("../models/countryModel");
const { stateSchemaModel } = require("../models/stateModel");
const { citySchemaModel } = require("../models/cityModel");

module.exports = {
  getCountry: async (req, res) => {
    countrySchemaModel.find({}, (err, country) => {
      if (err) {
        res.status(500).json({ error: true, data: err });
      } else {
        res.status(200).json({ error: false, data: country });
      }
    });
  },

  getState: async (req, res) => {
    const state = await stateSchemaModel
      .find({ countryId: req.body.countryid })
      .populate("countryId");
    if (!state) {
      res.status(500).json({ error: true, data: "no state found !" });
    } else {
      res.status(200).json({ error: false, data: state });
    }
  },

  //   getCity: async (req, res) => {
  //     const city = await citySchemaModel.find({}).populate("stateId");
  //     if (!city) {
  //       res.status(500).json({ error: true, data: "no city found !" });
  //     } else {
  //       res.status(200).json({ error: false, data: city });
  //     }
  //   },
};
