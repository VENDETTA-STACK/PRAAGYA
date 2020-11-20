var mongoose = require("mongoose");

var blockUserSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    UserId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    VictimId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    Date: {
        type: Date,
        default: Date.now(),
    },
    Status:Boolean,
});
var blockuserModel =  mongoose.model("BlockUser",blockUserSchema);

module.exports = {
  blockuserModel
}  