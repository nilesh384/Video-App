import asyncHandler from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import User from "../models/user.model.js"
import {extractPublicIdFromUrl, uploadOnCloudinary, deleteOnCloudinary} from "../utils/cloudinary.js"
import apiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        //saving refresh token in mongodb so that we dont have to always login once accesstoken expires
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});    //so that rest of the datamember of mongodb do not kick in

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
    
    if(!(email || username)){
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
    User.findByIdAndUpdate(
        req.user._id,
        {$unset: {refreshToken: 1}},
        {new: true}
    );

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200).
    clearCookie("accessToken", options).
    clearCookie("refreshToken", options).
    json(
        new apiResponse(
            200,
            {},
            "User logged out Successfully"
        )
    )
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    try {
        if(!incomingRefreshToken){
            throw new apiError(401, "Unauthorised request")
        }
    
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN);
        const user = await User.findById(decodedToken?.id)
    
        if(!user){
            throw new apiError(401, "Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new apiError(401, "Refresh Token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler( async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id);

    const isPassCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPassCorrect){
        throw new apiError(400, "Invalid old Password . cannot change it")
    }

    user.password = newPassword;
    user.save({validateBeforeSave: false});

    return res
    .status(200)
    .json(
        new apiResponse(200,{},"Password changed successfully")
    )
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullname, email} = req.body;

    if(!fullname || !email){
        throw new apiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname: fullname,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new apiResponse(200,user,"Details updated successfully")
    )

})

const getCurrentUser = asyncHandler( async (req, res) => {
    return res
    .status(200)
    .json(new apiResponse(200, req.user, "User fetched successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is required");
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new apiError(404, "User not found");
    }

    // Step 1: Delete old avatar from Cloudinary (if it exists and not default avatar)
    if (user.avatar && user.avatar.includes("res.cloudinary.com")) {
        const publicId = extractPublicIdFromUrl(user.avatar);
        const result = await deleteOnCloudinary(publicId);
    }

    // Step 2: Upload new avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar || !avatar.url) {
        throw new apiError(400, "Could not upload new avatar to Cloudinary");
    }

    // Step 3: Update user
    user.avatar = avatar.url;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(
        new apiResponse(200, user, "Avatar updated successfully")
    );
});


const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverPhotoLocalPath = req.file?.path;

    if (!coverPhotoLocalPath) {
        throw new apiError(400, "Cover Image is required");
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new apiError(404, "User not found");
    }

    // Step 1: Delete old cover from Cloudinary (if it exists and not default avatar)
    if (user.coverphoto && user.coverphoto.includes("res.cloudinary.com")) {
        const publicId = extractPublicIdFromUrl(user.avatar);
        await deleteOnCloudinary(publicId);
    }

    // Step 2: Upload new cover image
    const coverphoto = await uploadOnCloudinary(coverPhotoLocalPath);

    if (!coverphoto || !coverphoto.url) {
        throw new apiError(400, "Could not upload new avatar to Cloudinary");
    }

    // Step 3: Update user
    user.coverphoto = coverphoto.url;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(
        new apiResponse(200, user, "Cover Image updated successfully")
    );
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.query;

    if(!username?.trim()){
        throw new apiError(400, "Username is missing")
    }

    const channel = await User.aggregate([

        {$match: {
            username: username?.toLowerCase()
        }},

        {$lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }},

        {$lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        }},

        {$addFields: {
            subscribersCount: {$size: "$subscribers"},
            subscribedToCount: {$size: "$subscribedTo"},
            isSubscribed: {$cond: {
                if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                then: true,
                else: false
            }} 
        }},

        {$project: {
            subscribersCount: 1,
            subscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverphoto: 1,
            fullname: 1,
            username: 1,
            email: 1,
            _id: 1
        }}  
    ])

    if(!channel?.length){
        throw new apiError(404, "Channel not found");
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, channel[0], "Channel profile fetched successfully")
    )
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)                                  //as mongoose does not function in aggregation
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        }
    ])

    if (!user.length) {
        return res.status(404).json(new apiResponse(404, null, "User not found"));
      }
      

    return res
    .status(200)
    .json(
        new apiResponse(200, user[0].watchHistory, "Watch history fetched successfully")
    )
})

export {registerUser, 
        loginUser, 
        logoutUser, 
        refreshAccessToken, 
        changeCurrentPassword, 
        getCurrentUser, 
        updateAccountDetails, 
        updateUserAvatar,
        updateUserCoverImage,
        getUserChannelProfile,
        getWatchHistory
}