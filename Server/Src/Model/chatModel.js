import mongoose from 'mongoose'
const chat=new mongoose.Schema({
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
    },
    receiverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
    },
    
    attachment:{
        type:String,
        default:''
    },
    message:{
        type:String,
    },
    datejoined:{
        type:Date,
        default:Date.now
    }
},{timestamps:true});
const chatModel=mongoose.model('chat',chat);
export default chatModel

