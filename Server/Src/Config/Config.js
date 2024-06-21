
import mongoose from 'mongoose'
const connectDb=async(Url)=>{
    try {
     const connection=await mongoose.connect(Url)
      console.log('connection succefull')
    } catch (error) {
        console.log(`something went wrong ${error}`)
        process.exit(1)
    }   
}
export default connectDb