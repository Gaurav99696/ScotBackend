// const express = require("express");
// const mongoose = require("mongoose");
// const initRoutes = require("./routes/index");
// const { validateUserMsg } = require("./validations/user.validations");
// const cors = require("cors");
// const { findUserBy } = require("./servise/user.servise");
// const io = require("socket.io")(5000, {
//   cors: {
//     origin: ["http://localhost:3000"],
//   },
// });

// require("dotenv").config();

// const app = express();

// app.use(express.json());
// app.use(cors());
// initRoutes(app);

// mongoose
//   .connect(process.env.MONGO_DB_URI)
//   .then(() => {
//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on port ${process.env.PORT}`);
//     });
//     console.log("Connected! YOU ARE CONNECTED TO YOUR DATABASE!");
//   })
//   .catch(() => console.log("faild! YOU ARE NOT CONNECTED TO YOUR DATABASE!"));

// io.on("connection", (socket) => {
//   socket.on("sendMSG", async ({sender, content, reciver}) => {
//     const data = {
//       content,
//     };

//     const { error } = validateUserMsg(data);

//     const getReciver = await findUserBy("userName", reciver);

//     const getSender = await findUserBy("userName", sender);

//     const addMsgToReciver = await getReciver.messages.push({
//       sender,
//       content,
//     });

//     const addMsgToSender = await getSender.messages.push({ sender, content });

//     await getReciver.save();
//     await getSender.save();

//     socket.broadcast.emit("reciveMSG", {sender, content, reciver});
//   });
// });

// const express = require("express");
// const mongoose = require("mongoose");
// const initRoutes = require("./routes/index");
// const { validateUserMsg } = require("./validations/user.validations");
// const cors = require("cors");
// const { findUserBy } = require("./servise/user.servise");
// require("dotenv").config();

// const app = express();
// const port = process.env.PORT || 5000;

// app.use(express.json());
// app.use(cors());
// initRoutes(app);

// mongoose
//   .connect(process.env.MONGO_DB_URI)
//   .then(() => {
//     const server = app.listen(port, () => {
//       console.log(`Server is running on port ${port}`);
//     });
//     console.log("Connected! YOU ARE CONNECTED TO YOUR DATABASE!");

//     // Set up Socket.IO server
//     const io = require("socket.io")(server, {
//       path: "/chat", // Set the path for Socket.IO
//       cors: {
//         origin: ["http://localhost:3000"],
//       },
//     });

//     io.on("connection", (socket) => {
//       console.log("A user connected to /chat");

//       socket.on("sendMSG", async ({ sender, content, reciver }) => {
//         const data = { content };

//         const { error } = validateUserMsg(data);
//         if (error) {
//           socket.emit("error", error.details[0].message);
//           return;
//         }

//         const getReciver = await findUserBy("userName", reciver);
//         const getSender = await findUserBy("userName", sender);

//         getReciver.messages.push({ sender, content });
//         getSender.messages.push({ sender, content });

//         await getReciver.save();
//         await getSender.save();

//         socket.broadcast.emit("reciveMSG", { sender, content, reciver });
//       });

//       socket.on("disconnect", () => {
//         console.log("A user disconnected from /chat");
//       });
//     });

//     io.on("error", (error) => {
//       console.log(`Socket.IO error: ${error}`);
//     });
//   })
//   .catch(() => console.log("faild! YOU ARE NOT CONNECTED TO YOUR DATABASE!"));


const express = require("express");
const mongoose = require("mongoose");
const initRoutes = require("./routes/index");
const { validateUserMsg } = require("./validations/user.validations");
const cors = require("cors");
const { findUserBy } = require("./servise/user.servise");
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
      path: '/chat', // Set the path for Socket.IO
      cors: {
        origin: ["https://scot-uybn.onrender.com"], // Update this to the origin of your client if different
      },
    });

    io.on("connection", (socket) => {
      console.log('A user connected to /chat');

      socket.on("sendMSG", async ({ sender, content, reciver }) => {
        const data = { content };

        const { error } = validateUserMsg(data);
        if (error) {
          socket.emit("error", error.details[0].message);
          return;
        }

        const getReciver = await findUserBy("userName", reciver);
        const getSender = await findUserBy("userName", sender);

        getReciver.messages.push({ sender, content });
        getSender.messages.push({ sender, content });

        await getReciver.save();
        await getSender.save();

        socket.broadcast.emit("reciveMSG", { sender, content, reciver });
      });

      socket.on("disconnect", () => {
        console.log('A user disconnected from /chat');
      });
    });

    io.on("error", (error) => {
      console.log(`Socket.IO error: ${error}`);
    });

  })
  .catch(() => console.log("faild! YOU ARE NOT CONNECTED TO YOUR DATABASE!"));