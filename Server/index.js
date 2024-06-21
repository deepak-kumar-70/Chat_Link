import express from "express";
import connectDB from "./Src/Config/Config.js";
import router from "./Src/Route/routes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import chatModel from "./Src/Model/chatModel.js";
dotenv.config({
  path: "./.env",
});

const app = express();
const mongoUrl = process.env.MONGO_URL;
const port = process.env.PORT;

connectDB(mongoUrl);

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookies from browser to pass through
  })
);

app.use(express.static("./Src/Public"));
app.use(express.json());
app.use(cookieParser());
app.use("/user", router);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});
const userSocket = new Map();
const socketUser = new Map();
io.on("connection", (socket) => {
  const clientsId = socket.id;

  console.log("A user connected", socket.id);
  socket.on("findUser", ({ senderId, receiverId }) => {
    userSocket.set(senderId, socket.id);
    socketUser.set(socket.id, senderId);
    const recipientUser = userSocket.get(receiverId);
    if (senderId && receiverId) {
      io.to(recipientUser).emit("userStatus", { status: "Online" });
    }
    userSocket.set(senderId, socket.id);
    console.log(senderId, receiverId, "op");
  });
  socket.on("typing", ({ val, receiverId }) => {
    const recipientUser = userSocket.get(receiverId);
    if (!(val == null)) {
      console.log(val, "val");
      io.to(recipientUser).emit("typing", { status: "typing..." });
    }
  });
  socket.on("send message", async ({ message, receiverId, senderId }) => {
    userSocket.set(senderId, socket.id);
    const dbChat = {
      senderId: senderId,
      receiverId: receiverId,
      message: message,
    };

    const recipientUser = userSocket.get(receiverId);
    console.log(recipientUser, userSocket.size, "opd");
    if (recipientUser) {
      io.to(recipientUser).emit("send message", {
        message,
        senderId: senderId,
      });

      socket.emit("send message", { message, senderId:senderId,receiverId:receiverId });
    }

    try {
      if (message) {
        await chatModel.create(dbChat);
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("disconnect", () => {
  const offlineUser= socketUser.get(socket.id)
   if(offlineUser){
    io.emit("userStatus", { status: "Offline", userId: offlineUser });
    userSocket.delete(offlineUser);
    console.log(
      `User with socket ID ${clientsId} removed from map`
    );
   }
   
    
  });
});

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
