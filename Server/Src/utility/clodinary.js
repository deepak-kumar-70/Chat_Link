import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config({
  path:'././.env'
})
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
const uploadCloudnary=async(path)=>{
  try {
    let imagess=await cloudinary.uploader.upload(path,
        { resource_type: "auto"},
     function(error,imagess) {console.log(error); });
     return imagess.secure_url;
} catch (error) {
    fs.unlinkSync(path);
    console.log(error)
}

  
}
export {uploadCloudnary}
