const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
    senderId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    receiverId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    message:{
        type:String,
    },
},
{
    timestamps:true
})

const User = mongoose.model("Chat",chatSchema);

module.exports = User;