import mongoose from 'mongoose'
const user=new mongoose.Schema({
    name:{
        type:String,
        required:true
    
    },
    password:{
        type:String,
        required:true
    },
    avatar:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true,
        unique:true
    },
    datejoined:{
        type:Date,
        default:Date.now
    }
},{timestamps:true});
const userModel=mongoose.model('User',user);
export default userModel

