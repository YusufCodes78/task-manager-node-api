import express from "express";
import User from "../models/user.js";
import auth from "../middlewares/auth.js";
const router = express.Router();
import multer from "multer";
import sharp from "sharp";
import { sendCancelationEmail, sendWelcomeEmail } from "../emails/account.js";

const upload = multer(
  {
    limits: {
      fileSize: 1000000,
    },
    fileFilter: (req,file,cb)=>{
      if(!file.originalname.match(/\.(png|jpg|jpeg)$/)){
        return cb(new Error('Please upload an image file'));
      }
      cb(null, true);
    }
  }
);

// Store User
router.post("/user/store", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.send({user, token});
    res.status(200);
    sendWelcomeEmail(user.email, user.name);
    console.log("user created");
  } catch (err) {
    res.status(400).send(err);
    console.log("Error creating user");
  }
});
// Get Authenticated User
router.get("/user/me", auth, async (req, res) => {
  res.send(req.user);
  res.status(200);
  console.log("Fetched user");
});
// Update User by id
router.patch("/user/me",auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(200).send(req.user);
    console.log("Updated user");
  } catch (err) {
    res.status(400).send(err);
    console.log("Error updating user");
  }
});
// Delete User
router.delete("/user/me", auth, async (req, res) => {
  try {
    console.log(req.user);
    await req.user.deleteOne({ _id: req.user._id });
  res.status(200).send(req.user);
  sendCancelationEmail(req.user.email, req.user.name);
  console.log("Deleted user");
  } catch (err) {
    res.status(404).send(err);
    console.log("Error deleting user");
  }
  
});
// Login User
router.post("/user/login" ,async (req,res)=>{
  try{
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.send({user, token});
    res.status(200);
    console.log("user logged in");
  }
  catch(err){
    res.status(400).send("Error logging in user");
    console.log("Error logging in user");
  }
})
// Logout User
router.post("/user/logout", auth ,async (req,res)=>{
  try{
    const user = req.user;
    user.tokens = user.tokens.filter((token)=> token.token !== req.token);
    await user.save();
    res.status(200).send("Logged out sucessfully!");
    console.log("user logged out");
  }
  catch(err){
    res.status(500).send("Error logging out user");
    console.log("Error logging out user");
  }
})
// Logout all sessions of User
router.post("/user/logoutAll", auth ,async (req,res)=>{
  try{
    const user = req.user;
    user.tokens = [];
    await user.save();
    res.status(200).send("Logged out of all sessions sucessfully!");
    console.log("user logged out of all sessions");
  }
  catch(err){
    res.status(500).send("Error logging out user");
    console.log("Error logging out user");
  }
})
// Upload avatar of the user
router.post('/user/me/avatar', auth, upload.single('avatar'), async(req,res)=>{
  const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.status(200).send('Avatar uploaded successfully')
}, (err, req,res,next)=>{
  res.status(400).send("An error occured");
})
// Delete avatar of the user
router.delete('/user/me/avatar', auth, async(req,res)=>{
  req.user.avatar = null;
  await req.user.save();
  res.status(200).send('Avatar deleted successfully')
}, (err, req,res,next)=>{
  res.status(400).send("An error occured");
})
// Get Avatar of the user

router.get('/user/:id/avatar', async(req,res)=>{
  try{
    const user = await User.findById(req.params.id);
    if(!user || !user.avatar){
      throw new Error();
    }
    res.set('Content-Type', 'image/jpg');
    res.status(200).send(user.avatar);
  }
  catch(err){
    res.status(404).send();
  }
})


export default router;
