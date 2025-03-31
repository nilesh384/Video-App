// require('dotenv').config({path: "./.env"})      reduces consistency of the code as require and import both statements are used

import dotenv from"dotenv";                         // dotenv is a package to read the .env file and set the environment variables

import dbConn from "./databases/dbConn.js";
import app from "./app.js";


dotenv.config({ path: "./.env" });                 // dotenv is a package to read the .env file and set the environment variables

dbConn()
.then(() => {

    app.on("close", (error) => {
        console.log("Server closed")
        throw error
    })

    app.listen(process.env.PORT || 8000, () => {
        console.log(`🚀 Server started on port ${process.env.PORT}`);
    })
})
.catch((err) => {"Mongodb connection failed", err})












//alternative way

// const startServer = async () => {
//     try {
//         await dbConn(); // Wait for database connection
//         console.log("✅ MongoDB connected successfully");

//         const PORT = process.env.PORT || 8000;

//         const server = app.listen(PORT, () => {
//             console.log(`🚀 Server started on port ${PORT}`);
//         });

//         // Handle server close events
//         server.on("close", (error) => {
//             console.log("❌ Server closed");
//             if (error) console.error(error);
//         });

//     } catch (error) {
//         console.error("❌ MongoDB connection failed", error);
//         process.exit(1); // Exit process if DB fails
//     }
// };

// // Start the server
// startServer();







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