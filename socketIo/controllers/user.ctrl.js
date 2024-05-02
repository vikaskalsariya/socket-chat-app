const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const imgUploading = require("../config/upload");
const Chat = require("../models/Chat.model");
const Group = require("../models/Group.model");
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