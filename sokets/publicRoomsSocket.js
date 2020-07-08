//created by Hatem Ragap
const _ = require("underscore");
const { publicChatRoomModel } = require("../models/publicChatRoomModel");

const {
  PublicRoomMessageSchemaModel
} = require("../models/PublicRoomsMessagesModel");

module.exports = io => {
  io.of("/api/joinPublicRoom").on("connection", socket => {

    let roomId;
    socket.on("joinPublicRoom", function(msg) {
      let objectValue = JSON.parse(msg);
        roomId = objectValue["roomId"];
      let user_name = objectValue["user_name"];
      socket.join(roomId);

      var clientsInRoom = io.nsps["/api/joinPublicRoom"].adapter.rooms[roomId];
      var numClients =
        clientsInRoom === undefined
          ? 0
          : Object.keys(clientsInRoom.sockets).length;

          let w =
          '{"sender_name":"' +user_name +'", "numClients":"' +numClients +'"}';

      socket.to(roomId).emit("UserJoin", w);
    });

    socket.on("getNumOfClints", async msg => {
        var clientsInRoom = io.nsps["/api/joinPublicRoom"].adapter.rooms[msg];
        var numClients =
          clientsInRoom === undefined
            ? 0
            : Object.keys(clientsInRoom.sockets).length;
            socket.to(msg).emit("onNumOfClints", numClients);

    });


    socket.on("new_comment", async msg => {
      let objectValue = JSON.parse(msg);
      let message = objectValue["message"];
      let sender_id = objectValue["sender_id"];
      let sender_name = objectValue["sender_name"];
      let sender_img = objectValue["sender_img"];
      let room_id = objectValue["room_id"];

      let model = PublicRoomMessageSchemaModel({
        message: message,
        sender_id: sender_id,
        sender_name: sender_name,
        sender_img: sender_img,
        room_id: room_id
      });

      await model.save();

      let w =
        '{"sender_id":"' +
        sender_id +
        '","sender_name":"' +
        sender_name +
        '","message":"' +
        message +
        '","sender_img":"' +
        sender_img +
        '","room_id":"' +
        room_id +
        '"}';

      socket.to(room_id).broadcast.emit("RoomMsgReceive", w);
    });

    socket.on("disconnect", socket => {
      console.log("a user is Disconnected from Public Room ");

    });
  });
};
