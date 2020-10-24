var mongoose = require("mongoose");

var counterSchema = mongoose.Schema({
    totalUsers : {
        type : Number
    },
    totalPosts : {
        type : Number
    },
    totalState : {
        type : Number
    },
    totalCity : {
        type : Number
    }, 
});
var counterModel =  mongoose.model("CounterData",counterSchema);

module.exports = {
  counterModel
}  