const mongoose = require("mongoose");
const multer = require("multer");
const userSchema = mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
    },
    password:{
        type:String,
    },
    image:{
        type:String,
    },
    isOnline:{
        type:Boolean,
        default:false
    },
},
{
    timestamps:true
})

const storage = multer.memoryStorage()
userSchema.statics.imgUpload = multer({ storage: storage }).single('image')

const User = mongoose.model("User",userSchema);

module.exports = User;