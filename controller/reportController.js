"use strict";
//created by Hatem Ragap
const Joi = require("joi");
const reportSchemaModel  = require("../models/reportModel");
var admin = require("firebase-admin");
const { post } = require("../app");
const { select } = require("underscore");

module.exports = {
     
    createReport: async function(req,res,next){
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
                res.status(200).json({ isSuccess : true , Data : saveReportPost , Message : "Post Reported" });
            }else{
                res.status(400).json({ isSuccess : true , Data : 0 , Message : "Post Report Failed" });
            }    
        } catch (error) {
            res.status(500).status({ isSuccess : false , Message : error.message });
        }
  },

  getAllReport: async function(req,res,next){
    try {
        var record = await reportSchemaModel.find()
                                            .populate({
                                                path : 'reportedUser',
                                                select : 'name' 
                                            })
                                            .populate({
                                                path : 'post_id',
                                                select : 'post_img' 
                                            })
                                            .populate({
                                                path : 'reportedBy',
                                                select : 'name' 
                                            });

        if(record){
            res.status(200).json({ isSuccess : true , Data : record , Message : "Data Found" });
        }else{
            res.status(400).json({ isSuccess : true , Data : 0 , Message : "Data Not Found" });
        }    
    } catch (error) {
        res.status(500).status({ isSuccess : false , Message : error.message });
    }
},

};


