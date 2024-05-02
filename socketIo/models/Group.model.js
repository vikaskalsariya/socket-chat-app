const mongoose = require("mongoose");
const multer = require("multer");
const groupSchema = mongoose.Schema({
    creater_id:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    groupName:{
        type:String,
        require:true
    },
    image:{
        type:String,
        require:true
    },
    limit:{
        type:Number,
        require:true
    }
},
{
    timestamps:true
})

const storage = multer.memoryStorage()
groupSchema.statics.imgUpload = multer({ storage: storage }).single('image')

const Group = mongoose.model("Group",groupSchema);

module.exports = Group;