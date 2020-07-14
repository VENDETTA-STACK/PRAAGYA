var mongoose = require("mongoose");

var affiliationSchema = mongoose.Schema({
  Name: String,
});

var affiliationSchemaModel = mongoose.model("Affiliation", affiliationSchema);

module.exports = {
  affiliationSchemaModel,
};
