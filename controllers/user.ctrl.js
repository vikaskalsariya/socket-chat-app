const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const imgUploading = require("../config/upload");
const Chat = require("../models/Chat.model");
const Group = require("../models/Group.model");
const Member = require("../models/Member.model");
const mongoose = require("mongoose")
exports.registerLoad = async (req, res) => {
    try {
        res.render("register");
    } catch (err) {
        console.log(err);
    }
}
exports.register = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.render("register", { message: "User already exists" });
        }
        if (req.file) {
            req.body.image = await imgUploading(req.file.buffer);
            const hashPass = await bcrypt.hash(req.body.password, 10);
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: hashPass,
                image: req.body.image
            })
            user.save();
            res.render("login");
        }
        else {
            res.send("Please upload image");
        }
    } catch (err) {
        console.log(err);
    }
}

exports.loginLoad = async (req, res) => {
    try {
        res.render("login");
    } catch (err) {
        console.log(err);
    }
}
exports.login = async (req, res) => {
    try { 
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            if (isMatch) {
                req.session.user = user;
                res.cookie("user", JSON.stringify(user))
                res.redirect("/dashboard");
            }
            else {
                res.render("login", { passMessage: "Invalid password" });
            }
        }
        else {
            res.render("login", { message: "User not found" });
        }
    }
    catch (err) {
        console.log(err);
    }
}

exports.dashboardLoad = async (req, res) => {
    try {
        if (req.session.user) {
            const users = await User.find({ _id: { $nin: req.session.user._id }});
            res.render("dashboard", { user: req.session.user ,users:users});
        }
        else {
            res.redirect("/login");
        }
    } catch (err) {
        console.log(err);
    }
}

exports.logout = async (req, res) => {
    try {
        res.clearCookie('user')
        req.session.destroy();
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
}

exports.saveChat = async (req, res) => {
    try {
        const chat = new Chat({
            senderId: req.body.sender_id,
            receiverId: req.body.receiver_id,
            message: req.body.message
        })
        const chatdata = await chat.save();
        res.status(200).json({msg:"Chat saved successfully",success:true,data:chatdata});
    } catch (err) {
        console.log(err);
        res.status(400).json({msg:"somthing wrong",success:false});
    }
}

exports.deleteChat = async (req, res) => {
    try {
        const chat = await Chat.deleteOne({_id:req.body.id});
        res.status(200).json({msg:"Chat deleted successfully",success:true,data:chat});
    } catch (err) {
        console.log(err);
        res.status(400).json({msg:"somthing wrong",success:false});
    }
}


exports.groupLoad = async (req, res) => {
    try{

        const groups = await Group.find({creater_id:req.session.user._id});
        res.render("group",{groups : groups});
    }catch(err)
    {
        console.log(err);
    }
}

exports.createGroup = async (req, res) => {
    try {
        const imgURL = await imgUploading(req.file.buffer);

        const userId = req.session.user

        const group = new Group({
            creater_id: userId._id,
            groupName: req.body.groupName,
            image: imgURL,
            limit: req.body.limit
        })
        const groupdata = await group.save();

        const groups = await Group.find({creater_id:req.session.user._id});

        res.render('group',{message:"group created successfully" , groups : groups});
    } catch (err) {
        console.log(err);
        res.render('group',{msg:"somthing wrong",success:false});
    }
}

exports.getMembers = async (req,res)=>{
    try{
 const members = await User.aggregate([
    {
        $lookup:{
            from:"members",
            localField:"_id",
            foreignField:"user_id",
            pipeline:[
                {
                    $match:{
                        $expr:{
                            $and:[
                                {
                                    $eq:["$groupId",new mongoose.Types.ObjectId(req.body.group_id)]
                                }
                            ]
                        }
                    }
                }
            ],
            as:"members"
        }
    },{
        $match:{
            "_id":{
                $nin:[ new mongoose.Types.ObjectId(req.session.user._id)]
            }
        }
    }
]);

res.status(200).json({msg:"group members fetched successfully",success:true,data:members});

    }catch(err){
        console.log(err.message)
        res.status(400).json({msg:"somthing wrong"+err.message,success:false});
    }
}

exports.addMembers = async(req,res)=>{
    try{
        if(!req.body.members)
        {
            res.status(200).json({msg:"please select members",success:false});
        }
        else if(req.body.members.length > req.body.limit)
        {
            res.status(200).json({msg:"please select less than "+req.body.limit,success:false});
        }
        else{
            await Member.deleteMany({groupId:req.body.gruop_id})
            console.log('req.body.group_id', req.body.gruop_id)
            const members = req.body.members.map((v,i)=>{
                return {
                    groupId:req.body.gruop_id,
                    user_id:v
                }
            })
            const member = await Member.insertMany(members);
            res.status(200).json({msg:"members added successfully",success:true,data:member});
        }
    }catch(err){
        console.log(err.message)
        res.status(400).json({msg:"somthing wrong",success:false});
    }
}