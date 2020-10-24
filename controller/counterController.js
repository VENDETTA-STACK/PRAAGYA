"use strict";
//created by Hatem Ragap
const { userSchemaModel } = require("../models/userModel");
const { commentSchemaModel } = require("../models/commentsModel");
const { postSchemaModel } = require("../models/postsModel");
const { notificationsSchemaModel } = require("../models/notificationsModel");
const { stateSchemaModel } = require("../models/stateModel");
const { citySchemaModel } = require("../models/cityModel");
const { likesSchemaModel } = require("../models/likesModel");
const { blocksSchemaModel } = require("../models/blockUser");
const { messageSchemaModel } = require("../models/messagesModel");

var admin = require("firebase-admin");

module.exports = {

    counterDataSet: async (req, res) => {
        
        let TotalUsers = await userSchemaModel.find();
        let TotalPosts = await postSchemaModel.find();
        let TotalState = await stateSchemaModel.find();
        let TotalCity = await citySchemaModel.find();
        // let TotalLikes = await likesSchemaModel.find();
        let TotalComments = await commentSchemaModel.find();
        // let TotalBlocksUser = await blocksSchemaModel.find();
        let TotalMessage = await messageSchemaModel.find();
        let TotalCounterDataSet = {
            Users : TotalUsers.length,
            Posts : TotalPosts.length,
            // Likes : TotalLikes.length,
            Comments : TotalComments.length,
            // Blocks : TotalBlocksUser.length,
            States : TotalState.length,
            City : TotalCity.length,
            Message : TotalMessage.length,
        }
        res.send({ error: false, data: TotalCounterDataSet });
      }
};

