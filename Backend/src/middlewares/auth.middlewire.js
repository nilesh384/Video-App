import { apiError } from "../utils/apiError";
import asyncHandler from "../utils/asyncHandler";
import User from "../models/user.model"; 

const verifyJwt = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!token){
        throw new apiError(401, "Unauthorized Request")
    }

    const user = 
})