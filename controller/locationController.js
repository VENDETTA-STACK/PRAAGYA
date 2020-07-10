const countrySchema = require("../models/countryModel");
const stateSchema = require("../models/stateModel");
const citySchema = require("../models/cityModel");

module.exports = {
  insertCountry: async (req, res) => {
    country = countrySchema({
      Name: req.body.name,
    });
    country.save();
  },

  getCountry: async (req, res) => {
    const country = await countrySchema.find({});
    if (!country) {
      res.status(500).json({ error: true, data: "no country found !" });
    } else {
      res.status(200).json({ error: false, data: country });
    }
  },

  getState: async (req, res) => {
    const state = await stateSchema.find({});
    if (!state) {
      res.status(500).json({ error: true, data: "no state found !" });
    } else {
      res.status(200).json({ error: false, data: state });
    }
  },

  getCity: async (req, res) => {
    const city = await citySchema.find({});
    if (!city) {
      res.status(500).json({ error: true, data: "no city found !" });
    } else {
      res.status(200).json({ error: false, data: city });
    }
  },
};
