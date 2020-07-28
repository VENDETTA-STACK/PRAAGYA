var mongoose = require("mongoose");

var stateSchema = mongoose.Schema({
  Name: String,
  code: String,
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: true,
  },
});

var stateSchemaModel = mongoose.model("State", stateSchema);

module.exports = {
  stateSchemaModel,
};
