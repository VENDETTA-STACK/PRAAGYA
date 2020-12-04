'use strict';
//created by Hatem Ragap
const express = require('express');
const messageRouter = new express.Router;
const messageController = require('../controller/messageController');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'uploads/users_messages_img',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({storage: storage});

//commentRouter.post('/create',commentController.create);
messageRouter.post('/fetch_all', messageController.fetchAll);
messageRouter.post('/fetch_all_messages', messageController.getAllMessageData);
messageRouter.post('/deleteMessageById', messageController.deleteMessageById);
// messageRouter.post('/deleteAll', messageController.deleteAll);
messageRouter.post('/upload_img_message', upload.single('img'), messageController.uploadMessageImageOnly);


module.exports = messageRouter;
