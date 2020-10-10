var mongoose = require("mongoose");

var blockUserSchema = mongoose.Schema({
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
    Date:Date,
    Status:Boolean,
});
var blockuserModel =  mongoose.model("BlockUser",blockUserSchema);

module.exports = {
  blockuserModel
}  