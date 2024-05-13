const mongoose = require("mongoose");
const memberSchema = mongoose.Schema({
    groupId:{
        type:mongoose.Schema.ObjectId,
        ref:"Group"
    },
    user_id:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    },
},
{
    timestamps:true
})

const Member = mongoose.model("Member",memberSchema);

module.exports = Member;