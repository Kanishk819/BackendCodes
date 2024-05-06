// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import dotenv from "dotenv"

import express from "express"
import connectDB from "./db/index.js";
const app = express()

// Approach 1
// ';' is only for cleaning purposes
/*(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
        console.log("ERROR : ",error);
        throw error;
    })

    app.listen(process.env.PORT , () => {
        console.log(`App is listening on port ${process.env.PORT}`)
    })
  } catch (error) {
    console.error("ERROR : ", error);
    throw err;
  }
})();*/



//Approach 2:

dotenv.config({
    path: './env'
})

connectDB();