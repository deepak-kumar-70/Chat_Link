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
  const uploadAttachment = (filePath) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(filePath, { resource_type: 'auto' }, (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          // Clean up the local file after upload
          fs.unlinkSync(filePath);
          resolve(result);
        }
      });
    });
  };
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
export {uploadCloudnary,uploadAttachment}
