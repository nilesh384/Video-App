import asyncHandler from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import User from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";


const registerUser = asyncHandler( async (req, res) => {
    
    // get user details from frontend
    // validation — not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object — create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {username, email, fullname, password} = req.body
    console.log(`email is:  ${email}`)
    console.log(`password is:  ${password}`)
    console.log(`fullname is:  ${fullname}`)
    console.log(`username is:  ${username}`)

    if(fullname === "" || username === "" || email === "" || password === "")
    {
        throw new apiError(400,"Please fill all the fields")   
    }

    const existedUser = User.findOne({
        $or: [
            {email},{username}]
    })

    if(existedUser){
        throw new apiError(409, "Username or email already exists")
    }

    //we get req.files from multer
    const avatarLocalFilePath = req.files?.avatar[0]?.path;
    const coverphotoLocalFilePath = req.files?.coverphoto[0]?.path;

    if (!avatarLocalFilePath) {
        throw new apiError(400, "Avatar is required! ")
    }

    const avatar = await uploadOnCloudinary(avatarLocalFilePath)
    const coverphoto = await uploadOnCloudinary(coverphotoLocalFilePath)

    if (!avatarLocalFilePath) {
        throw new apiError(400, "Avatar is required! ")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullname,
        avatar: avatar.url,
        coverphoto: coverphoto?.url || "",
        password
    })

    // finding the creation and -password -refreshToken will not be shown
    const createdUser = await User.findById(_id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered successfully")
    )

} )

export {registerUser}