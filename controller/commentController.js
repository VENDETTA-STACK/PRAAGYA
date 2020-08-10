"use strict";
//created by Hatem Ragap
const { userSchemaModel } = require("../models/userModel");
const { commentSchemaModel } = require("../models/commentsModel");
const { postSchemaModel } = require("../models/postsModel");
const { notificationsSchemaModel } = require("../models/notificationsModel");

var admin = require("firebase-admin");

module.exports = {
  createComment: async (req, res) => {
    
    const {
      user_id,
      post_owner_id,
      post_id,
      comment,
      //old
      //name
      //new bcoz req from app side is user_name kd
      user_name,
      user_img,
    } = req.body;
    const commentModel = new commentSchemaModel({
      user_id: user_id,
      post_id: post_id,
      comment: comment,
      //old
      //name: name,
      //new  bcoz req we are passing varaible of user_name kd
      user_name : user_name,
      user_img: user_img,
    });
    await commentModel.save(async (err) => {
      if (err) {
        res.status(500).json({
          error: true,
          data: "err" + err,
        });
      } else {
        //send notif if not my  comment and save notif
        if (user_id !== post_owner_id) {
          let userToNotify = await userSchemaModel
            .findOne({ _id: post_owner_id })
            .exec();
          let peerToken = userToNotify["token"];

          var payload = {
            notification: {
              body: `${name} add Comment your post`,
              title: "Praagya App",
            },
            data: {
              id: `${post_id}`,
              post_owner_id: `${post_owner_id}`,
              screen: "comment",
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
          let notificationModel = new notificationsSchemaModel({
            name: name,
            title: "commented on your post",
            userImg: user_img,
            postId: post_id,
            notif_to_user: post_owner_id,
            my_id: user_id,
          });
          await notificationModel.save();
        }

        let posts = await postSchemaModel.findById(post_id);
        posts.commentsCount = ++posts.commentsCount;
        await posts.save();

        res.status(200).json({ error: false, data: commentModel });
      }
    });
  },
  deleteComment: async (req, res) => {
    const { comment_id, post_id } = req.body;

    await commentSchemaModel.findByIdAndRemove(comment_id);
    let posts = await postSchemaModel.findById(post_id);
    posts.commentsCount = --posts.commentsCount;
    await posts.save();
    res.status(200).json({ error: false, data: "done" });
  },
  getComments: async (req, res) => {
    const { post_id } = req.body;
    const comments = await commentSchemaModel
      .find({ post_id: post_id })
      .sort({ created: 1 });
    if (comments.length === 0) {
      res.send({ error: true, data: "No Comments" });
    } else {
      res.send({ error: false, data: comments });
    }
  },
};
