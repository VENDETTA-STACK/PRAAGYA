"use strict";
//created by Hatem Ragap
const Joi = require("joi");
const reportSchemaModel  = require("../models/reportModel");
var admin = require("firebase-admin");
const { post } = require("../app");

module.exports = {
     
    createReport: async function(req,res,next){
        console.log("Hellooooooooooooooooooooow........................!!!!");
        try {
            var { reportedUser , post_id , reportedBy , date , reason } = req.body;
            var record = await new reportSchemaModel({
                reportedUser : reportedUser,
                post_id : post_id,
                reportedBy : reportedBy,
                date : date,
                reason : reason
            });
            
            var saveReportPost = record.save();

            if(saveReportPost){
                res.status(200).json({ isSuccess : true , Data : saveReportPost , Message : "Data Found" });
            }else{
                res.status(400).json({ isSuccess : true , Data : 0 , Message : "Data Not Found" });
            }    
        } catch (error) {
            res.status(500).status({ isSuccess : false , Message : error.message });
        }
  },

};


