import jwt from "jsonwebtoken";
import User from "../models/user.js";
const auth = async (req, res, next) => {
    try{
        const token = req.header("Authorization").replace("Bearer ", "");
        const decrypt = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({_id: decrypt._id, "tokens.token": token});
    
        if(!user){
            throw new Error()
        }
    
        req.user = user;
        req.token = token;
        next();
    }
    catch(e){
        res.status(401).send({error: "Please authenticate"});
    }
    
}
export default auth;