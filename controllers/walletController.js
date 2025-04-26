const Wallet = require('../models/wallet');
const mongoose = require("mongoose");
const User = require("../models/user");
const Transaction = require("../models/transaction");
//Create a Wallet Manually 
exports.createWallet = async (req, res) => {
    try{
        const{ userId} = req.body;
        if(!userId) {
            return res.status(400).json({message:"userId is required"});
        }  
        console.log("Checking if wallet exists for users:", userId)
        const existingWallet = await Wallet.findOne({userId});
        if (existingWallet) {
            return res.status(400.).json({message:"Wallet already exists"});

        }
        const newWallet = new Wallet ({userId,balance:0});
        await newWallet.save();
        console .log ("Wallet created successfully for user:", userId);
        res.status(201).json({message:"Wallet created successfully", wallet: newWallet});

        } catch (error) {
            res.status(500).json({message:"Server error", error});
        }
};
// Get wallet balance
exports.getWallet = async (req, res) => {
    try{
        const {userId} = req.params;
        const wallet = await Wallet.findOne({userId});
        if (!wallet) {
            return res.status(404).json({message:"Wallet not found"});
        }
        res.json({balance: wallet.balance});
 } catch (error) {
    res.status(500).json({message:"Server error", error});
 }
};
//Deposit money
exports.depositMoney = async (req, res) =>{
    try{
        const{userId, amount} = req.body;
        if (!userId|| amount <= 0) {
            return res.status(400).json({message:"Invalid deposit details"});
        }
        let  wallet = await Wallet.findOne({userId});
        if (!wallet) {
            wallet = new Wallet ({ userId, balance:0})

 }
 console .log ("Wallet before Deposit:", wallet); 
 wallet.balance+= amount;
 await wallet.save();
 await Transaction.create({userId, type:"deposit",amount, balance: wallet.balance});
 // save transaction
 
console.log ("Wallet After Deposit:", wallet);
return res.status(200).json({
message: "Deposit successful",
balance:wallet.balance
});
} catch (error) {
console.error("Deposit Error:", error);
return res.status(500).json({message: "server error"});
}
};
//Withdraw money
exports.withdrawMoney = async (req, res) => {
    try{
        const { userId, amount} = req.body;
        if (!userId|| amount <= 0|| isNaN(amount)) {
            return res.status(400).json({ message:"Invalid withdrawal details"});
 }
 const wallet = await Wallet.findOne({ userId});
 if (!wallet) {
    return res.status(404).json({ message: "Wallet not found"});

 }
 console.log("Walleet Before Withdrawal:", wallet);
 if(wallet.balance< amount) {
    return res.status(403).json({ message:"Insufficient balance"});
 }
 wallet.balance -= amount;
 await wallet.save();
 console.log("Wallet After Withdrawal:", wallet);
 // Save Transaction 
 await Transaction.create({ userId, type : "withdraw", amount, balance: wallet.balance});
 res.json({ message: "Withdrawl successful", balance: wallet.balance});
    }
    catch (error) {
        res.status(500).json({ message:"Server error", error});
    }
};
//Transfer money between users 
exports.transferFunds = async (req,res) => {
    try{
        const {senderId,receiverId,amount} =req.body;
        if (!senderId||!receiverId|| amount <= 0) {
            return res.status(400).json({message:"Invalid transfer details"});

        }
        const senderWallet = await Wallet.findOne({userId: senderId});
        const receiverWallet = await Wallet.findOne({ userId: receiverId });

        if (!senderWallet||!receiverWallet) {
            return res .status (404).json({message: "one or both users do not have Wallets" });
} 
 if (senderWallet.balance < amount ) {
    return res.status(400).json({message: "Insufficient balance"});
 }
 senderWallet.balance -= amount;
 receiverWallet.balance += amount;
 await senderWallet.save();
 await receiverWallet.save();
 //Save transaction
 await Transaction.create({ userId:senderId, type: "transfer", amount, senderId,receiverId})
 res.json({message:"Transfer successfuyl", senderBalance: senderWallet.balance,receiverBalance:receiverWallet.balance});
  }catch (error) {
    res.status(500).json({message:"Server error",error});
  }
};
// Get Transaction history 
exports.getTransaction = async (req, res) => {
    try{
        const {userId} = req.params;
        const transaction = await Transaction.find({
            $or: [{ userId}, {senderId:userId}, {receiverId: userId}]
        }).sort({ timestamp: -1 });
    res.json({ transaction});
    } catch (error) {
        res.status(500).json({message:"Server error", error});
    }
};

    