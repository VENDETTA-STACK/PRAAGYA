var mongoose = require("mongoose");

var countrySchema = mongoose.Schema({
  Name: String,
});

var Country = mongoose.model("Country", countrySchema);

module.exports = {
  Country,
};
