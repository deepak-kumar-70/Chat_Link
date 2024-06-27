import mongoose from 'mongoose'
const group=new mongoose.Schema({
    groupName:{
        type:String,
        required:true
    },
    admin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
    },
    member:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userModel",
        }
    ],
    datejoined:{
        type:Date,
        default:Date.now
    }
},{timestamps:true});
const chatModel=mongoose.model('group',group);
export default chatModel

