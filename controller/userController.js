"use strict";
const Joi = require("joi");
const passwordHash = require("password-hash");
var moment = require("moment-timezone");
const fs = require("fs");
const fetch = require("node-fetch");
const axios = require("axios");
const { userSchemaModel } = require("../models/userModel");
const { postSchemaModel } = require("../models/postsModel");
const { likeSchemaModel } = require("../models/likesModel");
const { commentSchemaModel } = require("../models/commentsModel");
const { stateSchemaModel } = require("../models/stateModel");
const { affiliationSchemaModel } = require("../models/affiliationModel");
const { blockuserModel } = require("../models/blockUser");
const { degrees, PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const { worker } = require("cluster");
const { use } = require("../app");
var mongoose = require("mongoose");
const { populate } = require("../models/reportModel");
const multer = require("multer");

// var schoolLogoLocation = multer.diskStorage({
//   destination: function (req, file, cb) {
//       cb(null, "uploads/schoolLogo");
//   },
//   filename: function (req, file, cb) {
//       cb(
//           null,
//           file.fieldname + "_" + Date.now() + path.extname(file.originalname)
//       );
//   },
// });

// var uploadSchoolLogo = multer({ storage: schoolLogoLocation });

module.exports = {

  // uploadSchoolLogo,

  createUser: async (req, res) => {
    const user = {
      name: req.body.name,
      mobileNumber: req.body.mobileNumber,
    };
    const { error } = createUserValidation(user);
    if (!error) {
      var mobileNumber = await userSchemaModel.find({ mobileNumber: req.body.mobileNumber });
      // mobile = await userSchemaModel.find({
      //   personalNumber: req.body.personalnumber,
      // });
      //if (email.length == 0 && mobile.length == 0) {}
      console.log("Mobile Number found: " + JSON.stringify(mobileNumber));
      if (mobileNumber.length == 0) {
        //const hashedPassword = await passwordHash.generate(req.body.password);
        var membershipNumber = await creatingmembershipid(
          req.body.state,
          req.body.affilatedwith
        );
        var genreatedPDF = await createmembershippdf(req.body.name);
        const file = req.file;
        return new Promise((resolve, reject) => {
          const userModel = userSchemaModel({
            name: req.body.name,
            email: req.body.email,
            mobileNumber: req.body.mobileNumber,
            gender: req.body.gender,
            dob: req.body.dob,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            stateCode: membershipNumber.statecode,
            affiliationCode: membershipNumber.affiliationcode,
            membershipNumber: membershipNumber.membershipcode,
            schoolName: req.body.schoolName,
            // schoolLogo: file != undefined ? file.path : "",
            boardName: req.body.boardName,
            schoolAddress: req.body.schoolAddress,
            schoolLocation: req.body.schoollocation,
            affilatedWith: req.body.affilatedwith,
            afillatedNumber: req.body.affilatednumber,
            Status: true,
            membershipPDF: genreatedPDF,
            created: moment()
              .tz("Asia/Calcutta")
              .format("DD MM YYYY, h:mm:ss a"),
          });
          userModel.save(async (err) => {
            if (err) {
              console.log("err:" + err.message);
              const errObj = err.keyValue;
              const errFields = Object.keys(errObj);

              let errorStr = "";
              errFields.forEach(errField => {
                if(err.code == 11000) {
                  errorStr += `${errField} already exists. Please chose another.`;
                } else {
                  errorStr += `name: ${err.name}, code: ${err.code}, errorInField: ${errObj[errField]}`;
                }
              });
              
              console.log("err-3: " + errorStr);
              res.status(500).json({
                error: true,
                data: errorStr,
                chatId: [],
              });
            } else {
              res.status(200).json({
                error: false,
                data: "Register Successfully",
               });
              try{
                // for sending message
                //sms URL -http://websms.mitechsolution.com/api/push.json?apikey=5ea7f55b01122&route=vtrans&sender=PNDDEL&mobileno=8347766166&text=Testingg%20%20
                  var body =
                    "Dear " +
                    req.body.name +0
                    ", " +
                    "Congratulation for being Member of " +
                    req.body.name +
                    " Family. Your Membership Id is " +
                    membershipNumber.statecode +
                    membershipNumber.affiliationcode +
                    "-" +
                    membershipNumber.membershipcode +
                    "." +
                    "Kindly copy the following link to genrate Membership Certificate. http://15.206.249.190/api/uploads/Certificate/" + genreatedPDFv;
                  var url =
                      "http://websms.mitechsolution.com/api/push.json?apikey=5ea7f55b01122&route=vtrans&sender=PNDDEL&mobileno="+ req.body.personalnumber +"&text="+ body;
                  let getResponse = await axios.get(url);
                  console.log(getResponse.data.ErrorMessage);
                  res.send(200).json({ error: false, data: userModel });
              }
              catch(err){
                console.log("err-1: " + err.message);
                res.send(500).json({
                  error : true,
                  data : "Registration unsuccessfull",
                });
              }
            }
          });
        });
      } else {
       // if (email.length == 1 && mobile.length == 1) {
        if (mobileNumber.length == 1 ) {
          res.send({ error: true, data: "Mobile Number already registered." });
        } else {
          if (mobileNumber.length == 1) {
            res.send({ error: true, data: "Mobile Number already registered." });
          }
          // } else {
          //   res.send({ error: true, data: "Mobile already taken" });
          // }
        }
      }
    } else {
      console.log("err-2: " + error.details[0].message);
      let detail = error.details[0].message;
      res.send({ error: true, data: detail });
    }
  },
  loginUser: async (req, res) => {
    const { error } = loginUserValidation(req.body);
    if (!error) {
      const { mobileNumber } = req.body;
      const user = await userSchemaModel.findOne({ mobileNumber });
      console.log(user);
      if (!user) {
        res.status(500).json({ error: true, data: "No Mobile Number found please register first!" });
      }
      
      if (user.Status == false) {
        res.status(500).json({ error: true, data: "User is blocked." });
      }
      else{
        res.status(200).json({ error: false, data: user });
      } 
    } else {
      let detail = error.details[0].message;
      res.send({ error: true, data: detail });
    }
  },
  getUser: async (req, res) => {
    const { error } = idValidation(req.body);
    if (!error) {
      let id = `${req.body.user_id}`;
      const user = await userSchemaModel.findById(id);
      // .populate({
      //   path: "country",
      //   select: "Name",
      // })
      // .populate({
      //   path: "state",
      //   select: "name",
      // })
      // .populate({
      //   path: "affilatedWith",
      //   select: "Name",
      // });
      if (!user) {
        res.status(500).json({ error: true, data: "no user found !" });
      } else {
        res.status(200).json({ error: false, data: user });
      }
    } else {
      let detail = error.details[0].message;
      res.send({ error: true, data: detail });
    }
  },

  getUserWeb: async (req, res) => {
    const { error } = idValidation(req.body);
    if (!error) {
      let id = `${req.body.user_id}`;
      const user = await userSchemaModel
        .findById(id)
        .populate({
          path: "country",
          select: "Name",
        })
        .populate({
          path: "state",
          select: "name",
        })
        .populate({
          path: "affilatedWith",
          select: "Name",
        });
      if (!user) {
        res.status(500).json({ error: true, data: "no user found !" });
      } else {
        res.status(200).json({ error: false, data: user });
      }
    } else {
      let detail = error.details[0].message;
      res.send({ error: true, data: detail });
    }
  },

  getUserByEmail: async (req, res) => {
    if (req.body.email) {
      let email = req.body.email;
      const user = await userSchemaModel.find({
        name: { $regex: email },
      });
      console.log(user);
      if (!user) {
        res.status(500).json({ error: true, data: "no user found !" });
      } else {
        res.status(200).json({ error: false, data: user });
      }
    } else {
      res.send({ error: true, data: "user Email required" });
    }
  },

  getUsers: async (req, res) => {
    //const user = await userSchemaModel.find({Status:true}).sort({ created: -1 });
    const { UserId } = req.body;
    var blockUsersList = await blockuserModel.find({ UserId: mongoose.Types.ObjectId(UserId) });
      //console.log(blockUsersList);
      let blockUsersIds = [];
      for(var i=0;i<blockUsersList.length;i++){
        blockUsersIds.push(blockUsersList[i].VictimId);
      }
      console.log(blockUsersIds);
    const user = await userSchemaModel.find({ _id: { $nin: blockUsersIds } })
                                      .sort({ created: -1 })
                                      .populate({
                                        path: "affilatedWith"
                                      });

  //   const user = await userSchemaModel.aggregate([
  //     {
  //       $project: {
  //         "_id": {
  //           "$toString": "$_id"
  //         }
  //       }
  //     },
  //     {
  //       "$lookup":
  //         {
  //           from: "BlockUser",
  //           localField: "_id",
  //           foreignField: "UserId",
  //           as: "Blocked Users"
  //         }
  //    }
  //  ]);
    if (!user) {
      res.status(500).json({ error: true, data: "no user found !" });
    } else {
      res.status(200).json({ error: false, Count: user.length ,data: user });
    }
  },
  verifyUser: async (req, res) => {
    /* 0 means false and 1 means true */

    var id = req.body.Id;
    var status = req.body.Status;
    var sts = status == 0 ? true : false;
    userSchemaModel.findByIdAndUpdate(
      id,
      {
        Status: sts,
      },
      (err, record) => {
        if (err) {
          res.send({ error: true, data: "err" + err });
        } else {
          res.send({ error: false, data: record });
        }
      }
    );
  },

  get_likes_posts_comments_counts: async (req, res) => {
    const { error } = idValidation(req.body);
    if (!error) {
      let id = `${req.body.user_id}`;

      let postsCount = await postSchemaModel
        .find({ user_id: id })
        .countDocuments()
        .exec();
      let likesCount = await likeSchemaModel
        .find({ user_id: id })
        .countDocuments()
        .exec();
      let commentsCount = await commentSchemaModel
        .find({ user_id: id })
        .countDocuments()
        .exec();
      res.status(200).json({
        error: false,
        likes: `${likesCount}`,
        posts: `${postsCount}`,
        comments: `${commentsCount}`,
      });
    } else {
      let detail = error.details[0].message;
      res.send({ error: true, data: detail });
    }
  },
  addUserImg: async (req, res) => {
    let user_id = req.body.user_id;
    let name = req.file.filename;
    let bio = req.body.bio;
    if (bio) {
      await userSchemaModel
        .findByIdAndUpdate(user_id, { img: name, bio: bio })
        .exec((err) => {
          if (err) res.send({ error: true, data: "err" + err });
          else res.send({ error: false, data: name });
        });
    } else {
      await userSchemaModel
        .findByIdAndUpdate(user_id, { img: name })
        .exec((err) => {
          if (err) res.send({ error: true, data: "err" + err });
          else res.send({ error: false, data: name });
        });
    }
  },
  addCoverImg: async (req, res) => {
    let user_id = req.body.user_id;
    let name = req.file.filename;
    await userSchemaModel
      .findByIdAndUpdate(user_id, { cover: name })
      .exec((err) => {
        if (err) res.send({ error: true, data: "err" + err });
        else res.send({ error: false, data: name });
      });
  },
  update_bio: async (req, res) => {
    let user_id = req.body.user_id;
    let bio = req.body.bio;
    const user = await userSchemaModel
      .findByIdAndUpdate(user_id, { bio: bio })
      .exec((err) => {
        if (err) res.send({ error: true, data: "err" + err });
        else res.send({ error: false, data: user });
      });
  },
  update_bio_and_name: async (req, res) => {
    let user_id = req.body.user_id;
    let bio = req.body.bio;
    let name = req.body.name;
    let dob = req.body.dob;
    let gender = req.body.gender;
    let personalNumber = req.body.personalNumber;
    let whatsappNumber = req.body.whatsappNumber;
    let schoolName = req.body.schoolName;
    let designation = req.body.designation;
    let qualification = req.body.qualification;
    let awardsAndAchievements = req.body.awardsAndAchievements;
    let skill1 = req.body.skill1;
    let skill2 = req.body.skill2;
    let skill3 = req.body.skill3;
    let mobilePrivacy = req.body.mobilePrivacy;
    await userSchemaModel
      .findByIdAndUpdate(user_id, {
        bio: bio,
        name: name,
        dob: dob,
        gender: gender,
        personalNumber: personalNumber,
        whatsappNumber: whatsappNumber,
        schoolName: schoolName,
        designation: designation,
        qualification: qualification,
        awardsAndAchievements: awardsAndAchievements,
        skill1: skill1,
        skill2: skill2,
        skill3: skill3,
        mobilePrivacy: mobilePrivacy,
      })
      .exec((err) => {
        if (err) res.send({ error: true, data: "err" + err });
        else res.send({ error: false, bio: bio, name: name });
      });
  },
  update_password: async (req, res) => {
    const { error } = updatePasswordValidation(req.body);
    if (!error) {
      let user_id = req.body.user_id;
      let old_password = req.body.old_password;
      let new_password = req.body.new_password;
      const user = await userSchemaModel.findOne({ _id: user_id });

      const isPasswordMatch = await passwordHash.verify(
        old_password,
        user.password
      );

      if (!isPasswordMatch) {
        res.status(500).json({ error: true, data: "password not match !" });
      } else {
        const hashedPassword = await passwordHash.generate(new_password);
        user.password = hashedPassword;
        user.save();
        res.status(200).json({ error: false, data: "done" });
      }
    } else {
      let detail = error.details[0].message;
      res.send({ error: true, data: detail });
    }
  },

  forget_password: async (req, res) => {
    const { error } = updatePasswordValidation(req.body);
    if (!error) {
      let user_id = req.body.user_id;
      let cnf_password = req.body.old_password;
      let password = req.body.new_password;
      const user = await userSchemaModel.findOne({ _id: user_id });
      if (!user) {
        res.status(500).json({ error: true, data: "password not match !" });
      } else {
        const hashedPassword = await passwordHash.generate(password);
        user.password = hashedPassword;
        user.confirmpassword = cnf_password;
        user.save();
        res.status(200).json({ error: false, data: "done" });
      }
    } else {
      let detail = error.details[0].message;
      res.send({ error: true, data: detail });
    }
  },

  updateAndAddUserToken: async function (req, res) {
    if (req.body.id && req.body.token) {
      await userSchemaModel.findByIdAndUpdate(req.body.id, {
        token: req.body.token,
      });
      res.status(500).json({
        error: false,
        data: "done",
      });
    } else {
      res.status(500).json({
        error: false,
        data: " user id is required ! or token ",
      });
    }
  },  

  blockUser: async function(req, res){
    var user_id = req.body.user_id;
    await userSchemaModel.findByIdAndUpdate(user_id,{Status:false});
    res.status(500).json({ error: true, data: "User is blocked." });
  },

  userBlock: async function(req,res,next){
    const { userId , victimId , status } = req.body;

    try {
    //   var existBlockedData = await blockuserModel.aggregate([
    //   { $group: { 
    //     _id: { userId: userId, victimId: victimId , Status: status }, 
    //     uniqueIds: { $addToSet: "$_id" },
    //     count: { $sum: 1 } 
    //   }}, 
    //   { $match: { 
    //     count: { $gte: 1 } 
    //   }}
    // ]);
      if(req.body.status == "true"){
        var existBlockedData = await blockuserModel.find({ 
          UserId: mongoose.Types.ObjectId(userId), 
          VictimId: mongoose.Types.ObjectId(victimId),
          Status: status, 
        });
        console.log(existBlockedData);
        if(existBlockedData.length != 0){
          res.status(200).json({
            IsSuccess: true,
            Data: 0,
            Message: "User is already Blocked",
          })
        }else{
          var record = new blockuserModel({
            UserId: userId,
            VictimId: victimId,
            Status: status,
          });
          
          if(record){
            await record.save();
            res.status(200).json({ IsSuccess: true , Data: 1 , Message: "User Blocked...!!!" });
          }else{
            res.status(400).json({ IsSuccess: true , Data: 0 , Message: "User Not Blocked...!!!" });
          }
        } 
      }else{
        var removeFromBlock = await blockuserModel.find({
          UserId: mongoose.Types.ObjectId(userId), 
          VictimId: mongoose.Types.ObjectId(victimId),
          Status: true
        });
        if(removeFromBlock){
          let removeId = removeFromBlock[0]._id;
          await blockuserModel.deleteOne({ _id: removeId});
          res.status(200).json({ IsSuccess: true , Data: 0 , Message: "Remove From Block" });
        }else{
          res.status(400).json({ IsSuccess: false , Message: "Id already unblock" });
        }
      }
    } catch (error) {
      res.status(500).json({ IsSuccess: false , Message: error.message });
    }    
  },

  userBlockRemove: async function(req,res,next){
    const { id } = req.body;
    try {
      var record = await blockuserModel.deleteOne({ _id: id});
      if(record){
        res.status(200).json({ IsSuccess: true , Data: 1 , Message: "Remove from Block...!!!" });
      }else{
        res.status(400).json({ IsSuccess: true , Data: 0 , Message: "Not Updates...!!!" });
      }
    } catch (error) {
      res.status(500).json({ IsSuccess: false , Message: error.message });
    }
  },

  getUserBlockList: async function(req,res,next){
    const { UserId } = req.body;

    try {

      var record = await blockuserModel.find({ UserId: UserId , Status: true })
                                     .populate({
                                       path : 'UserId',
                                       select : 'name'
                                     })
                                     .populate({
                                       path : 'VictimId',
                                      //  populate: {
                                      //    path: "country"
                                      //  },
                                       populate: {
                                         path: "state",
                                         populate: {
                                           path: "countryId"
                                         }
                                       },
                                     });
        // console.log(record[0])
      if(record){
        res.status(200).json({ error: false , data : record });
      }else{
        res.status(400).json({ error: true, data: "No Data Found...!!!" });
      }
    } catch (error) {
      res.status(500).json({ IsSuccess: false , Message: error.message });
    }
  },

  deleteBlock: async function(req,res,next){
    var record = await blockuserModel.deleteMany();
    res.json("Done");
  },

  getBlockUser: async function(req , res){
    const block_user_data = await blockuserModel.find()
                                                .populate({
                                                  path : 'UserId',
                                                  select : 'name'
                                                })
                                                .populate({
                                                  path : 'VictimId',
                                                });
    console.log(block_user_data);
    if(block_user_data){
      res.status(200).json({ error: false , data : block_user_data });
    }else{
      res.status(500).json({ error: true, data: "No Data Found...!!!" });
    }
  },

  unblockUser:async function(req, res){
    var user_id = req.body.user_id;
    await userSchemaModel.findByIdAndUpdate(user_id,{Status:true});
    res.status(500).json({error: true, data:"User is unblocked."})
  },

  getUserId: async (req, res) => {
    if (req.body.email) {
      let email = req.body.email;
      const user = await userSchemaModel.find({
        email: { $regex: email },
      });
      console.log(user);
      if (!user) {
        res.status(500).json({ error: true, data: "no user found !" });
      } else {
        res.status(200).json({ error: false, data: user });
      }
    } else {
      res.send({ error: true, data: "user Email required" });
    }
  },

  getdetails: async function(req, res){
    res.status(200).json({ error: false, data: 0 });
  },
  //WORKING API FOR GET USER BLOCKED USER NOT HANDLE
  // getUserMobile: async function(req, res){
  //   //const user = await userSchemaModel.find({Status:true}).sort({ created: -1 });
  //   const user = await userSchemaModel.find({_id:{$nin:req.body.id},Status:true}).sort({ created:-1 });
  //   if (!user) {
  //     res.status(500).json({ error: true, data: "no user found !" });
  //   } else {
  //     res.status(200).json({ error: false, data: user });
  //   }
  // },

  getUserMobiletest: async function(req,res){
    const user = await userSchemaModel.find({_id:{$nin:req.body.id}}).sort({ created:-1 });
    console.log(user.length);
    if(!user){
      res.status(500).json({ error: true, data: "no user found !" });
    } else{
      res.status(200).json({ error: false, data: user });
    }
  },

  userBlockbyUser : async function(req,res){
    return new Promise((resolve, reject) => {
      const record = blockuserModel({
        UserId:req.body.userid,
        VictimId : req.body.victimid,
        Date : Date.now(),
        Status:true,
      });
      record.save(async (err,data)=>{
        if(err){
          res.status(500).json({error:true, data:"You can not block user."});
        } else{
          if(data.length == 0){
            res.status(500).json({error:true, data:"You can not block user."});
          } else{
            res.status(200).json({error:false, data:data});
          }
        }
      });
    });
  },

  // Get Particular Users Block List

  // getUserBlockList: async function(req,res){

  //   const {  }

  // },
    
  

  //For Get User Display Handle Blocked User
  getUserMobile: async function(req,res){
    var record = [];
    const user = await userSchemaModel.find({_id:{$nin:req.body.userid},Status:true}).sort({ created:-1 }).select("_id");
    for(var userIndex = 0;userIndex<user.length;userIndex++){
      var checkpoint = await blockuserModel.find({UserId:req.body.userid,VictimId:user[userIndex]._id});
      if(checkpoint.length == 0){
        var userdata = await userSchemaModel.find({_id:user[userIndex]._id})
        record.push(userdata);
      }
    }
    if(record.length == 0){
      res.status(500).json({ error: true, data: "no user found !" });
    } else {
      res.status(200).json({ error: true, data: record });
    }
  },

  userUnblockbyUser : async function(req,res){
    const user = await blockuserModel.find({UserId:req.body.userid,VictimId:req.body.victimid}).remove();
    if(!user){
      res.status(500).json({ error: true, data: "no user found !" });
    } else{
      res.status(200).json({ error: true, data: "Done." });
    }
  },

  // removeAllUsers : async function(req,res){
  //   const record = await userSchemaModel.deleteMany();
  //   res.status(200).json({ message: "Done" });
  // },
  
  getuserbyfilter : async function(req,res){
    const user = await userSchemaModel.find({state:req.body.stateid,affilatedWith:req.body.affiatedid});
    if (!user) {
      res.status(500).json({ error: true, data: "no user found !" });
    } else {
      res.status(200).json({ error: false, data: user });
    }
  }
};

function createUserValidation(user) {
  const schema = Joi.object().keys({
    name: Joi.string().min(5).max(30).required(),
    mobileNumber: Joi.string().min(10).max(10).required(),
  });
  return Joi.validate(user, schema);
}

function updatePasswordValidation(user) {
  const schema = Joi.object().keys({
    user_id: Joi.string().required(),
    old_password: Joi.string().min(6).max(30).required(),
    new_password: Joi.string().min(6).max(30).required(),
  });
  return Joi.validate(user, schema);
}

function loginUserValidation(user) {
  const schema = Joi.object().keys({
    mobileNumber: Joi.required(),
  });
  return Joi.validate(user, schema);
}

function idValidation(id) {
  const schema = Joi.object().keys({
    user_id: Joi.required(),
  });
  return Joi.validate(id, schema);
}

async function createmembershippdf(name) {
  const url = "http://15.206.249.190/api/uploads/Certificate/Certificate.pdf";
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  // Get the width and height of the first page
  const { width, height } = firstPage.getSize();
  console.log(width);
  console.log(height);
  // Draw a string of text diagonally across the first page
  firstPage.drawText(name, {
    x: width / 2 - 50,
    y: height - 540,
    size: 20,
    color: rgb(0.95, 0.1, 0.1),
  });
  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();
  let pdfName = name + Date.now();
  fs.writeFileSync(
    "uploads/Certificate/" + pdfName + ".pdf",
    pdfBytes,
    "binary"
  );
  var result = "uploads/Certificate/" + pdfName + ".pdf";
  return result;
}

async function creatingmembershipid(state, affiliated) {
  var stateCode, affiliatedCode, record;
  var result = {};
  stateCode = await stateSchemaModel.findById(state).select("code -_id");
  affiliatedCode = await affiliationSchemaModel
    .findById(affiliated)
    .select("code -_id");
  record = await userSchemaModel.find({
    stateCode: stateCode.code,
    affiliationCode: affiliatedCode.code,
  });
  if (record.length == 0) {
    result = {
      statecode: stateCode.code,
      affiliationcode: affiliatedCode.code,
      membershipcode: "001",
    };
    return result;
  } else {
    console.log(record[record.length - 1].membershipNumber);
    var addNumber;
    addNumber = parseInt(record[record.length - 1].membershipNumber) + 1;
    if (addNumber.toString().length == 1) {
      addNumber = "00" + addNumber;
    } else if (addNumber.toString().length == 2) {
      addNumber = "0" + addNumber;
    } else {
      addNumber = addNumber;
    }
    result = {
      statecode: stateCode.code,
      affiliationcode: affiliatedCode.code,
      membershipcode: addNumber,
    };
    return result;
  }
}
