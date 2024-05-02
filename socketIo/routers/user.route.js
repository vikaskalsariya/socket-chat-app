const router = require("express").Router();
const user = require("../models/User.model");
const group = require("../models/Group.model");
const {isLogin,isLogout} = require("../middlewares/auth");
const {
    registerLoad,
    register,
    loginLoad,
    login,
    dashboardLoad,
    logout,
    saveChat,
    deleteChat,
    groupLoad,
    createGroup
} = require("../controllers/user.ctrl");

router.get("/register",isLogout,registerLoad)
router.post("/register",user.imgUpload,register);
router.get("/",isLogout,loginLoad)
router.post("/",login);
router.get("/logout",isLogin,logout);
router.get("/dashboard",isLogin,dashboardLoad);
router.post("/saveChat",saveChat)
router.post("/deleteChat",deleteChat)
router.get("/group",isLogin,groupLoad)
router.post("/group",group.imgUpload,createGroup)

module.exports = router;