// require('dotenv').config({path: "./.env"})      reduces consistency of the code as require and import both statements are used

import dotenv from"dotenv";                         // dotenv is a package to read the .env file and set the environment variables

import express from "express";
import dbConn from "./databases/dbConn.js";

const app = express();

dotenv.config({ path: "./.env" });                 // dotenv is a package to read the .env file and set the environment variables

dbConn()
.then(() => {

    app.on("close", (error) => {
        console.log("Server closed")
        throw error
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log(` Server started on port ${process.env.PORT}`);
    })
})
.catch((err) => {"Mongodb connection failed", err})






















// First Approach
/*
( async () => {

    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("Connected to DB")
        app.on("close", (error) => {
            console.log("Server closed")
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`Server started on port ${process.env.PORT}`)
        })

    }catch(e){
        console.error("ERROR: ", e)
        throw e
    }

} )()

*/

// Second approach is writing on a seperate file and importing it here