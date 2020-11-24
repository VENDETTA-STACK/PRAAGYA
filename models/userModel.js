//created by Hatem Ragap
var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
const Joi = require("joi");

var userSchema = mongoose.Schema({
  name: {
    type: String,
    max: 30,
    min: 5,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    max: 50,
    min: 5,
  },
  stateCode: String,
  affiliationCode: String,
  membershipNumber: String,
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: true,
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "State",
    required: true,
  },
  city: {
    type: String,
  },
  gender: String,
  dob: String,
  designation: String,
  schoolName: String,
  schoolAddress: String,
  schoolLocation: String,
  // schoolLogo: {
  //   type: String,
  //   default: "default-user-profile-image.png"
  // },
  // boardName: String,
  affilatedWith: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Affiliation",
    required: true,
  },
  afillatedNumber: String,
  whatsappNumber: String,
  personalNumber: String,
  Status: Boolean,
  token: { type: String, default: "" },
  password: {
    type: String,
    required: true,
    min: 6,
  },
  confirmpassword:String,
  img: {
    type: String,
    default: "default-user-profile-image.png",
  },
  cover: {
    type: String,
  },
  bio: {
    type: String,
    default: "Hi iam using Praagya App",
  },

  created: {
    type: String,
  },
  membershipPDF: String,
  designation: { type: String, default: "" },
  qualification: { type: String, default: "" },
  awardsAndAchievements: { type: String, default: "" },
  skill1: { type: String, default: "" },
  skill2: { type: String, default: "" },
  skill3: { type: String, default: "" },
  mobilePrivacy: {
    type: Boolean,
    default: false,
  },
  blockUsers: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlockUser", 
  }
});
// userSchema.plugin(uniqueValidator);
var userSchemaModel = mongoose.model("users", userSchema);

module.exports = {
  userSchemaModel,
};
