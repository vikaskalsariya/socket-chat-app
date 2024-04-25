const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const imgUploading = require("../config/upload");
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
        req.session.destroy();
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }
}