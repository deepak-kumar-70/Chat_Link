import userModel from "../Model/userModel.js";
import { uploadCloudnary } from "../utility/clodinary.js";
import bcrypt from "bcrypt";
import { sendToken } from "../utility/features.js";

const ResisterUser = async (req, resp) => {
  try {
    const { name, password, mobile } = req.body;

    if (!name || !password || !mobile) {
      return resp.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await userModel.findOne({ mobile });
    if (existingUser) {
      return resp.status(400).json({ message: "User already exists" });
    }
    const ImgPath = req.file?.path;
    if (!ImgPath) {
      return resp.status(400).json({ message: "Avatar is required" });
    }

    const avatarImg = await uploadCloudnary(ImgPath);

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new userModel({
        ...req.body,
        password: hashedPassword,
        avatar: avatarImg,
      });

      const result = await user.save();

      return sendToken(resp, result, 201, "Account created successfully");
    } else {
      resp.status(400).json({ message: "Passwords do not match" });
    }
  } catch (error) {
    console.error(error);
    resp.status(500).json({ message: "Internal server error" });
  }
};
const LoginUser = async (req, resp) => {
  try {
    const { mobile, password } = req.body;
    console.log;
    if (!mobile || !password) {
      return resp.status(400).json({ message: "All fields are required" });
    }

    const user = await userModel.findOne({ mobile });

    if (!user) {
      return resp.status(401).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (true) {
      sendToken(resp, user, 200, "Login successful");
    } else {
      resp.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.error(error);
    resp.status(500).json({ message: "Internal server error" });
  }
};
const getMyProfile = async (req, resp) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById({ _id: userId });
    if (!user) {
      return resp.status(404).send("user not found");
    } else {
      return resp.status(200).json({ user: user });
    }
  } catch (e) {
    resp.status(500).json({ message: "Internal server error" });
    console.error(e);
  }
};
const searchUser = async (req, resp) => {
  const { name } = req.query;
  try {
    let data;
    if (name) {
      const startsWithQuery = new RegExp(`^${name}`, "i");

      const containsQuery = new RegExp(name, "i");

      const startsWith = await userModel.find({ name: startsWithQuery });

      const contains = await userModel.find({
        name: containsQuery,
        _id: { $nin: startsWith.map((user) => user._id) },
      });

      data = [...startsWith, ...contains];
    } else {
      data = await userModel.find();
    }

    resp.send(data);
  } catch (error) {
    console.log(error);
    resp.status(500).send("Internal Server Error");
  }
};

export { ResisterUser, LoginUser, getMyProfile, searchUser };
