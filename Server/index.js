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
import { uploadAttachment } from "./Src/utility/clodinary.js";
import { upload } from "./Src/Middleware/multer.js";
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
app.post("/upload", upload.single("attachment"), async (req, res) => {
  try {
    const { message, receiverId, senderId } = req.body;
    console.log(req.file, "op");
    let attachmentUrl = null;

    if (req.file) {
      const result = await uploadAttachment(req.file.path);

      attachmentUrl = result.secure_url;
      console.log(attachmentUrl);
    }

    const data = { message, receiverId, senderId, attachment: attachmentUrl };
    await chatModel.create(data);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    res.status(500).send("Error uploading file.");
  }
});
const userSocket = new Map();
const socketUser = new Map();

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("findUser", ({ senderId, receiverId }) => {
    if (
      mongoose.Types.ObjectId.isValid(senderId) &&
      mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      userSocket.set(senderId, socket.id);
      socketUser.set(socket.id, senderId);
    } else {
      console.error("Invalid senderId or receiverId provided");
    }
  });
  socket.on("userStatus", ({ senderId }) => {
    const userStatus = userSocket.get(senderId);

    if (userStatus) {
      io.to(userStatus).emit("userStatus", { status: "Online", senderId });
    } else {
      io.to(userStatus).emit("userStatus", { status: "Offline" });
    }
  });
  socket.on("typing", ({ val, receiverId }) => {
    if (mongoose.Types.ObjectId.isValid(receiverId)) {
      const recipientUser = userSocket.get(receiverId);
      if (recipientUser && val !== null) {
        io.to(recipientUser).emit("typing", { status: "typing..." });
      }
    } else {
      console.error("Invalid receiverId provided");
    }
  });

  socket.on(
    "send message",
    async ({ message, receiverId, senderId, attachment }) => {
      if (
        !mongoose.Types.ObjectId.isValid(senderId) ||
        !mongoose.Types.ObjectId.isValid(receiverId)
      ) {
        console.error("Invalid senderId or receiverId provided");
        return;
      }

      userSocket.set(senderId, socket.id);
      const recipientUser = userSocket.get(receiverId);
      if(!recipientUser){
        socket.emit("messageTick",'singleTick')  
      }else if(senderId==receiverId){
        socket.emit("messageTick",'blueTick')  
      }
      
      else{
        socket.emit("messageTick",'boubleClick')  
      }
       
     

    if (recipientUser) {
        io.to(recipientUser).emit("send message", {
          message,
          senderId,
          attachment,
        });
      }
      if (senderId) {
        socket.emit("send message", {
          message,
          senderId,
          receiverId,
          attachment,
        });
      }
    }
  );

  socket.on("disconnect", () => {
    const offlineUser = socketUser.get(socket.id);
    socket.removeAllListeners("send message");
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
