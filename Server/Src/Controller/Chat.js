import chatModel from "../Model/chatModel.js";
import userModel from "../Model/userModel.js";
import mongoose from "mongoose";
const readMessage = async (req, resp) => {
  try {
    const { senderId, receiverId } = req.params;

    if (!senderId || !receiverId) {
      return resp
        .status(400)
        .json({ error: "senderId and receiverId are required" });
    }

    const message = await chatModel.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    resp.status(200).json(message);
  } catch (error) {
    console.error(error);
    resp
      .status(500)
      .json({ error: "An error occurred while fetching messages" });
  }
};
const allContactedUser = async (req, resp) => {
  try {
    const { senderId } = req.params;

    if (!senderId) {
      return resp.status(400).json({ error: "senderId is required" });
    }

    const messages = await chatModel.find({ senderId: senderId });

    if (!messages || messages.length === 0) {
      return resp
        .status(404)
        .json({ message: "No messages found for this senderId" });
    }

    const ObjectId = mongoose.Types.ObjectId;

    const contactUser = messages.map((data) => data.receiverId);
    const uniqueArray = [
      ...new Set(contactUser.map((id) => id.toString())),
    ].map((id) => new ObjectId(id));
   
    resp.status(200).json(uniqueArray);
  } catch (error) {
    console.error(error);
    resp
      .status(500)
      .json({ error: "An error occurred while fetching messages" });
  }
};

export { readMessage, allContactedUser };
