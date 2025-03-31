import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbConn = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("✅ Database connected.  HOST:", connectionInstance.connection.host);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

export default dbConn;


