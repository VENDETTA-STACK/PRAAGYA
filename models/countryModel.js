var mongoose = require("mongoose");

var countrySchema = mongoose.Schema({
  Name: String,
});

var countrySchemaModel = mongoose.model("Country", countrySchema);

module.exports = {
  countrySchemaModel,
};
