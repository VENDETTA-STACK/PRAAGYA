var mongoose = require("mongoose");

var stateSchema = mongoose.Schema({
  Name: String,
  countryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: true,
  },
});

var State = mongoose.model("State", stateSchema);

module.exports = {
  State,
};
