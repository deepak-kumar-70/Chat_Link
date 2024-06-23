import express from "express";
import connectDB from "./Src/Config/Config.js";
import router from "./Src/Route/routes.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import mongoose from "mongoose";
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
  console.log("A user connected", socket.id);

  socket.on("findUser", ({ senderId, receiverId }) => {
    if (mongoose.Types.ObjectId.isValid(senderId) && mongoose.Types.ObjectId.isValid(receiverId)) {
      userSocket.set(senderId, socket.id);
      socketUser.set(socket.id, senderId);
     
      console.log(senderId, receiverId, "User status updated to online");
    } else {
      console.error('Invalid senderId or receiverId provided');
    }
  });
  socket.on('userStatus',({senderId})=>{
    const userStatus=userSocket.get(senderId)
    console.log(userStatus,senderId,'oj')
    if(userStatus){
      io.to(userStatus).emit("userStatus", { status: "Online" ,senderId});
    }else{
      io.to(userStatus).emit("userStatus", { status: "Offline" });
    }
   
  })
  socket.on("typing", ({ val, receiverId }) => {
    if (mongoose.Types.ObjectId.isValid(receiverId)) {
      const recipientUser = userSocket.get(receiverId);
      if (recipientUser && val !== null) {
        io.to(recipientUser).emit("typing", { status: "typing..." });
      }
    } else {
      console.error('Invalid receiverId provided');
    }
  });

  socket.on("send message", async ({ message, receiverId, senderId }) => {
    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      console.error('Invalid senderId or receiverId provided');
      return;
    }

    userSocket.set(senderId, socket.id);
    const dbChat = { senderId, receiverId, message };
    const recipientUser = userSocket.get(receiverId);

    if (recipientUser) {
      io.to(recipientUser).emit("send message", { message, senderId });
      socket.emit("send message", { message, senderId, receiverId });
    }

    try {
      if (message) {
        await chatModel.create(dbChat);
      }
    } catch (error) {
      console.error('Error saving chat to database:', error);
    }
  });

  socket.on("disconnect", () => {
    const offlineUser = socketUser.get(socket.id);
    if (offlineUser) {
      io.emit("userStatus", { status: "Offline", userId: offlineUser });
      userSocket.delete(offlineUser);
      console.log(`User with socket ID ${socket.id} removed from map`);
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
