const express = require("express");
const mongoose = require("mongoose");
const initRoutes = require("./routes/index");
const { validateUserMsg } = require("./validations/user.validations");
const cors = require("cors");
const { findUserBy } = require("./servise/user.servise");
const Users = require("./models/user.model");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
initRoutes(app);

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    console.log("Connected! YOU ARE CONNECTED TO YOUR DATABASE!");

    // Set up Socket.IO server
    const io = require("socket.io")(server, {
      path: "/chat", // Set the path for Socket.IO
      cors: {
        origin: ["https://scot-uybn.onrender.com", "http://localhost:3000"], // Update this to the origin of your client if different
      },
    });

    io.on("connection", (socket) => {
      socket.on("sendMSG", async ({ sender, content, reciver }) => {
        const data = { content };

        const { error } = validateUserMsg(data);
        if (error) {
          socket.emit("error", error.details[0].message);
          return;
        }

        const getReciver = await findUserBy("userName", reciver);
        const getSender = await findUserBy("userName", sender);

        if (!getReciver || !getSender) {
          socket.emit("error", "User not found");
          return;
        }

        const reciverUpdate = await Users.updateOne(
          {
            userName: getSender.userName,
            "freand.userName": getReciver.userName,
          },
          {
            $push: { "freand.$.messages": { sender, reciver, content } },
          }
        );

        const senderUpdate = await Users.updateOne(
          {
            userName: getReciver.userName,
            "freand.userName": getSender.userName,
          },
          {
            $push: { "freand.$.messages": { sender, reciver, content } },
          }
        );

        if (reciverUpdate.nModified === 0 || senderUpdate.nModified === 0) {
          socket.emit("error", "Failed to update messages");
          return;
        }

        socket.broadcast.emit("reciveMSG", { sender, content, reciver });
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected from /chat");
      });
    });

    io.on("error", (error) => {
      console.log(`Socket.IO error: ${error}`);
    });
  })
  .catch(() => console.log("faild! YOU ARE NOT CONNECTED TO YOUR DATABASE!"));
