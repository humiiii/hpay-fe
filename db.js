const mongoose =require("mongoose");
 require ("dotenv").config();
 const connectDB = async() => {
    try {
   await mongoose.connect(process.env.MONGO_URI,{

   });
            
   
   console.log("MongoDB connected Successfully ");
   mongoose.connection.once("open",async() => {
      try{
         await mongoose.connection.db.collection("wallets").dropIndexes();
         console.log("Dropped existing indexes permanently.");
      } catch (error){
         console.log("No indexes to drop or error:", error.message);
      }
   });
   } catch (err) {
    console.error ("MongoDB connection Failed",err);
    process.exit(1);
   }
};
module.exports=connectDB;
    