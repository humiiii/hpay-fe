const mongoose =require("mongoose");

const transactionSchema = new mongoose.Schema  ({
    userId: { type: String, required: true },
    type: { type:String, enum:["deposit" , "withdraw","transfer"],  required: true  },
    amount:{ type:Number, required: true },
    senderId:{type: String, default:null},
    receiverId:{ type:String, default:null},
    timestamp: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Transaction", transactionSchema );