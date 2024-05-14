const express = require("express");
const mongoose = require("mongoose");
const initRoutes = require("./routes/index");
const { validateUserMsg } = require("./validations/user.validations");
const cors = require("cors");
const { findUserBy } = require("./servise/user.servise");
const io = require("socket.io")(4000, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());
initRoutes(app);

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    console.log("Connected! YOU ARE CONNECTED TO YOUR DATABASE!");
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch(() => console.log("faild! YOU ARE NOT CONNECTED TO YOUR DATABASE!"));

io.on("connection", (socket) => {
  socket.on("sendMSG", async ({sender, content, reciver}) => {
    const data = {
      content,
    };

    const { error } = validateUserMsg(data);

    const getReciver = await findUserBy("userName", reciver);

    const getSender = await findUserBy("userName", sender);
    
    const addMsgToReciver = await getReciver.messages.push({
      sender,
      content,
    });


    const addMsgToSender = await getSender.messages.push({ sender, content });

    await getReciver.save();
    await getSender.save();

    socket.broadcast.emit("reciveMSG", {sender, content, reciver});
  });
});
