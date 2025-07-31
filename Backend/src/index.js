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


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}