"use strict";
//created by Hatem Ragap
const Joi = require("joi");

const { postSchemaModel } = require("../models/postsModel");

const { notificationsSchemaModel } = require("../models/notificationsModel");
const { userSchemaModel } = require("../models/userModel");

const { likeSchemaModel } = require("../models/likesModel");
var admin = require("firebase-admin");
const { post } = require("../app");

module.exports = {
  createLike: async (req, res) => {
    const { user_id, post_id, peer_id, name, user_img } = req.body;

    const likeModel = new likeSchemaModel({
      user_id: user_id,
      post_id: post_id,
    });
    await likeModel.save(async (err) => {
      if (err) {
        res.status(500).json({
          error: true,
          data: "err" + err,
        });
      } else {
        let postData = await postSchemaModel.findById(post_id);

        postData.likes = ++postData.likes;
        postData.usersLiked.push(user_id);

        await postData.save();

        if (user_id !== peer_id) {
          let userToNotify = await userSchemaModel.findById(peer_id);
          console.log(userToNotify);
          console.log(userToNotify.token);
          if(userToNotify.token != " "){
            let peerToken = userToNotify.token;

            var payload = {
              notification: {
                body: `${name} has Like your post`,
                title: "V Chat App",
              },
              data: {
                id: `${post_id}`,
                post_owner_id: `${peer_id}`,
                screen: "like",
                click_action: "FLUTTER_NOTIFICATION_CLICK",
              },
            };
            var options = {
              priority: "high",
              timeToLive: 60 * 60 * 24,
            };
            admin
              .messaging()
              .sendToDevice(peerToken, payload, options)
              .then(function (ress) {})
              .catch(function (err) {
                console.log("error is " + err);
              });
            //save notif
            let notifModel = new notificationsSchemaModel({
              name: name,
              title: "Liked your post",
              userImg: user_img,
              postId: post_id,
              notif_to_user: peer_id,
              my_id: user_id,
            });
            await notifModel.save();
        }

      }
          
        res.status(200).json({ error: false, data: "done" });
      }
    });
  },
  deleteLike: async (req, res) => {
    const { error } = createLikeValidation(req.body);

    if (!error) {
      const { user_id, post_id } = req.body;

      //   const likeModel = new likeSchemaModel({user_id: user_id, post_id: post_id});
      await likeSchemaModel
        .find({ user_id: user_id, post_id: post_id })
        .remove();
      let postData = await postSchemaModel.findById(post_id);

      postData.likes = --postData.likes;
      postData.usersLiked.remove(user_id);
      await postData.save();

      res.status(200).json({ error: false, data: "done" });
    } else {
      let detail = error.details[0].message;
      res.send({ error: true, data: detail });
    }
  },
  disLike: async function(req,res){
    const { error } = createLikeValidation(req.body);
    if (!error) {
      const { user_id, post_id } = req.body;

      await likeSchemaModel.find({user_id:user_id, post_id:post}).remove();
      let postData = await postSchemaModel.findById(post_id);
      console.log("sdcda                zc z");
      console.log(postData);
      // postData.likes = --postData.likes;
      // postData.usersLiked.remove(user_id);
      await postData.save();

      res.status(200).json({error : false, data : "Done"});
    } else {
      let detail = error.details[0].message;
      res.send({error:true, data : detail});
    }
},
  fetchLikeData: async function(req,res){
    let record = await likeSchemaModel.find()
                                      .populate({
                                          path: "user_id",
                                          select: "name"
                                      })
                                      .populate({
                                          path: "post_id",
                                      });
    if(record){
      res.status(200).json({ isSuccess : true , Data : record , Message : "Data Found" });
    }else{
      res.status(400).json({ isSuccess : true , Data : 0 , Message : "Data Not Found" });
    }
  }

};

function createLikeValidation(like) {
  const schema = Joi.object().keys({
    post_id: Joi.string().required(),
    user_id: Joi.string().required(),
  });
  return Joi.validate(like, schema);
}
