import multer from 'multer'
import path from 'path'
const upload = multer({  
  storage : multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'src/public')        
        },
        filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const fileExtension = path.extname(file.originalname);
          cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
      }    
      }) ,
            
 })
  
export {upload}
  