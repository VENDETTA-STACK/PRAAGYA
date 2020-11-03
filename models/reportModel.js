const { strict, string } = require("joi");
var mongoose = require("mongoose");

var reportSchema = mongoose.Schema({
    reportedUser:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    post_id: {
        type: String,
        required: true,
        trim: true,
        ref: 'posts'
    },
    reportedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      }],
    date:{
        type : Date,
        default : Date.now() 
    },
    reason: {type : String},
});
var reportPostModel =  mongoose.model("ReportPost",reportSchema);

module.exports = reportPostModel;