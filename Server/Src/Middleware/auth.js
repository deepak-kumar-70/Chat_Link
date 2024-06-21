// import jwt from 'jsonwebtoken'
// const isAuthenticated =(req, res, next) => {
//     const token = req.cookies.chat_Karo_token;
//     console.log(token.chat_Karo_token,'token')
//     if (!token){
//         res.status(401).json({message:'please login to acess this route'})
//     }
//     const decodedData = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decodedData._id;
//     next();
// };
// export {isAuthenticated}