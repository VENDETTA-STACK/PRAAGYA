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
const { degrees, PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const { worker } = require("cluster");

module.exports = {
  createUser: async (req, res) => {
    console.log(req.body.name);
    const user = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };
    const { error } = createUserValidation(user);
    if (!error) {
      var email, mobile;
      email = await userSchemaModel.find({ email: req.body.email });
      mobile = await userSchemaModel.find({
        personalNumber: req.body.personalnumber,
      });
      if (email.length == 0 && mobile.length == 0) {
        const hashedPassword = await passwordHash.generate(req.body.password);
        var membershipNumber = await creatingmembershipid(
          req.body.state,
          req.body.affilatedwith
        );
        var genreatedPDF = await createmembershippdf(req.body.name);
        return new Promise((resolve, reject) => {
          const userModel = userSchemaModel({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            gender: req.body.gender,
            dob: req.body.dob,
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            stateCode: membershipNumber.statecode,
            affiliationCode: membershipNumber.affiliationcode,
            membershipNumber: membershipNumber.membershipcode,
            schoolName: req.body.schoolname,
            schoolLocation: req.body.schoollocation,
            affilatedWith: req.body.affilatedwith,
            afillatedNumber: req.body.affilatednumber,
            whatsappNumber: req.body.whatsappnumber,
            personalNumber: req.body.personalnumber,
            Status: true,
            membershipPDF: genreatedPDF,
            created: moment()
              .tz("Asia/Calcutta")
              .format("DD MM YYYY, h:mm:ss a"),
          });
          userModel.save(async (err) => {
            if (err) {
              res.status(500).json({
                error: true,
                data: "email already used choose another" + err,
                chatId: [],
              });
            } else {
              var body =
                "Dear " +
                req.body.name +
                ", " +
                "Congratulation for being Member of " +
                req.body.name +
                " Family. Your Membership Id is " +
                membershipNumber.statecode +
                membershipNumber.affiliationcode +
                "-" +
                membershipNumber.membershipcode +
                "." +
                "Kindly click the following link to genrate Membership Certificate.";
              var url =
                "http://promosms.itfuturz.com/vendorsms/pushsms.aspx?user=prclub&password=dns123&msisdn=" +
                req.body.personalnumber +
                "&sid=PRCLUB&msg=" +
                body +
                "&fl=0&gwid=2";
              let getResponse = await axios.get(url);
              console.log(getResponse.data.ErrorMessage);
              res.status(200).json({ error: false, data: userModel });
            }
          });
        });
      } else {
        if (email.length == 1 && mobile.length == 1) {
          res.send({ error: true, data: "Email and Mobile already taken" });
        } else {
          if (email.length == 1) {
            res.send({ error: true, data: "Email already taken" });
          } else {
            res.send({ error: true, data: "Mobile already taken" });
          }
        }
      }
    } else {
      let detail = error.details[0].message;
      res.send({ error: true, data: detail });
    }
  },
  loginUser: async (req, res) => {
    const { error } = loginUserValidation(req.body);
    if (!error) {
      const { email, password } = req.body;
      const user = await userSchemaModel.findOne({ email });
      if (!user) {
        res
          .status(500)
          .json({ error: true, data: "no email found please register !" });
      }
      const isPasswordMatch = await passwordHash.verify(
        password,
        user.password
      );
      if (!isPasswordMatch) {
        res.status(500).json({ error: true, data: "password not match !" });
      } else {
        if (user.Status == false) {
          res.status(500).json({ error: true, data: "User is blocked." });
        }
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
    const user = await userSchemaModel.find().sort({ created: -1 });
    if (!user) {
      res.status(500).json({ error: true, data: "no user found !" });
    } else {
      res.status(200).json({ error: false, data: user });
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
    let awards = req.body.awardsAndAchievements;
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
        awards: awards,
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
  // testing: async function (req, res) {

  // },
};

function createUserValidation(user) {
  const schema = Joi.object().keys({
    name: Joi.string().min(5).max(30).required(),
    email: Joi.string().email({ minDomainAtoms: 2 }).max(30).required(),
    password: Joi.string().min(6).max(30).required(),
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
    email: Joi.required(),
    password: Joi.required(),
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
  const url =
    "https://urgentneed.herokuapp.com/uploads/Certificate/Certificate.pdf";
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
    var addNumber;
    addNumber = parseInt(record[0].membershipNumber) + 1;
    console.log(addNumber.toString().length);
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
