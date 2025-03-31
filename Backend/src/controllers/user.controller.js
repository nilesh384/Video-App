import asyncHandler from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import User from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js";
import apiResponse from "../utils/apiResponse.js";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        //saving refresh tiken in mongodb so that we dont have to always login once accesstoken expires
        user.refreshToken = refreshToken;
        user.save({validateBeforeSave: false});    //so that rest of the datamember of mongodb do not kick in

        return {accessToken, refreshToken}

    } catch (error) {
        throw new apiError(500, "Something went wrong")
    }
}

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
    // console.log(`email is:  ${email}`)
    // console.log(`password is:  ${password}`)
    // console.log(`fullname is:  ${fullname}`)
    // console.log(`username is:  ${username}`)

    // console.log(req.body)

    if(fullname === "" || username === "" || email === "" || password === "")
    {
        throw new apiError(400,"Please fill all the fields")   
    }

    const existedUser = await User.findOne({
        $or: [
            {email},{username}]
    })

    if(existedUser){
        throw new apiError(409, "Username or email already exists")
    }

    //we get req.files from multer
    const avatarLocalFilePath = req.files?.avatar?.[0]?.path;
    // const coverphotoLocalFilePath = req.files?.coverphoto[0]?.path;  (we have to check if present)

    let coverphotoLocalFilePath = "";
    if (req.files && Array.isArray(req.files.coverphoto) && req.files.coverphoto.length>0) {
        coverphotoLocalFilePath = req.files.coverphoto[0].path;
    }


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
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered successfully")
    )

} )

const loginUser = asyncHandler(async (req,res) => {
    // req.body -> data
    // username or email
    // find the user
    // password check
    // generate access and refresh token
    // send cookies

    const {email, username, password} = req.body;
    
    if(!email || !username){
        throw new apiError(400, "username and email required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new apiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new apiError(401, "Password is incorrect")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).
    cookie("accessToken", accessToken, options).
    cookie("refreshToken", refreshToken, options).
    json(
        new apiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    
})

export {registerUser, loginUser, logoutUser}