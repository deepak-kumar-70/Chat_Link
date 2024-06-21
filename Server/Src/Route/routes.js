import express from 'express';
import { upload } from '../Middleware/multer.js';
import { ResisterUser,LoginUser, getMyProfile, searchUser } from '../Controller/userAuth.js';
import { allContactedUser, readMessage } from '../Controller/Chat.js';

const router = express();
router.post("/Resister", upload.single("avatar"), ResisterUser);
router.post("/Login",LoginUser);
router.get("/getMyProfile/:userId",getMyProfile);
router.get("/searchUser",searchUser)
router.get("/readChat/:senderId/:receiverId",readMessage)
router.get("/contactedUser/:senderId/",allContactedUser)
export default router
