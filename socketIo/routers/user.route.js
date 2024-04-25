const router = require("express").Router();
const user = require("../models/User.model");
const {isLogin,isLogout} = require("../middlewares/auth");
const {
    registerLoad,
    register,
    loginLoad,
    login,
    dashboardLoad,
    logout
} = require("../controllers/user.ctrl");

router.get("/register",isLogout,registerLoad)
router.post("/register",user.imgUpload,register);
router.get("/",isLogout,loginLoad)
router.post("/",login);
router.get("/logout",isLogin,logout);
router.get("/dashboard",isLogin,dashboardLoad);

module.exports = router;