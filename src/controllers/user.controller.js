import {ApiError} from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { fileUpload } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
const generateAccessTokenAndRefreshToken=async(userId)=>{
    try {
        const user=await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Log the user object to verify it's correct
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshTokens()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refresh token")
    }
}
const registerUser=asyncHandler(async(req ,res)=>{
  const {fullname,email,username,password}=req.body
  if(
    [fullname,email,username,password].some((field)=>field?.trim()==="")
  )
  {
    throw new ApiError(400,"All fields are required")
}
    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser)
    {
        throw new ApiError(409,"User with email or username already exists")
    }
    const avatarLocalPath=req.files?.avatar[0]?.path
    //const coverImageLocalPath=req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0)
    {
        coverImageLocalPath=req.files.coverImage[0].path
    }
    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar is required")
    }
    //console.log("Coverimage",coverImageLocalPath)
    //console.log("Avatarlocalpath",avatarLocalPath)
    //console.log(req.files)
    const avatar=await fileUpload(avatarLocalPath)
    const coverImage=await fileUpload(coverImageLocalPath)
    //console.log(req.files)
    if(!avatar)
    {
        new ApiError(400,"Avatar is Required")
    }
    const user=await User.create({
        fullname,
        password,
        username:username.toLowerCase(),
        email,
        avatar:avatar.url,
        coverImage:coverImage?.url || ""
    })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser)
    {
        throw new ApiError(500,"Something went wrong while registering the user")
    }
    return res.status(201).json(new ApiResponse(
     200,createdUser,"User Registered")
)

})
const loginUser=asyncHandler(async(req,res)=>{
    const {username,email,password}=req.body
    console.log(email)
    console.log(username)
    if(!email && !username)
    {
        throw new ApiError(400,"USername or email is required")
    }
    const user=await User.findOne(
        {
        $or:  [{email},{username}]
})
    if(!user)
    {
        throw new ApiError(404,"User not found")
    }
    const isPasswordValid=await user.isPasswordCorrect(password)
    if(!isPasswordValid)
    {
        throw new ApiError(401,"Password is incorrect")
    }
    const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id)
    console.log(accessToken)
    console.log(refreshToken)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json( new ApiResponse(200,{
        user:loggedInUser,accessToken,refreshToken
    },"USer Logged in SuccessFully"))
})
const logOutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:null
            }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,{},"User Logged Out"))
})
const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken)
    {
        throw new ApiError(401,"Error in refresh token")
    }
    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const user= await User.findById(decodedToken?._id)
        if(!user)
        {
            throw new ApiError(401,"Invalid Refresh Token")
        }
        if(incomingRefreshToken!==user?.refreshToken)
        {
            throw new ApiError(401,"RefreshToken is used or expired")
        }
        const {accessToken,newRefreshToken}=await generateAccessTokenAndRefreshToken(user._id)
        return res.status(200)
        .cookie("accessToken",accessToken)
        .cookie("refreshToken",newRefreshToken)
        .json(
            new ApiResponse(200,{
                accessToken,refreshToken:newRefreshToken},"Access Token Refreshed")
        )
    
    } catch (error) {
        throw new ApiError(401,"Invalid Refresh Token")
    }
})
const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    const user=await User.findById(req.user?._id)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect)
    {
        throw new ApiError(400,"Invalid old password")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password Changed Successfully"))

})
const getCurrentUser=asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200,req.user,"Current User fetched successfully"))
})
const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullname,email}=req.body
    if(!fullname || !email)//Changed needed username to fullname
    {
        throw new ApiError(400,"All fields are required")
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname,
                email
            }
        },
        {new:true}
    ).select("-password")
    console.log(user)
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account Details Updated successfully"))
})
const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if(!avatarLocalPath)
    {
        throw new ApiError(400,"Avatar is missing")
    }
    const avatar=await fileUpload(avatarLocalPath)
    if(!avatar.url)
    {
        throw new ApiError("Error while uploading on avatar")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,{$set:{avatar:avatar.url}},{new:true}).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar Updated successfully"))
})
const updateUsercoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path
    if(!coverImageLocalPath)
    {
        throw new ApiError(400,"coverImage is missing")
    }
    const coverImage=await fileUpload(coverImageLocalPath)
    if(!coverImage.url)
    {
        throw new ApiError("Error while uploading on coverImage")
    }
    const user=await User.findByIdAndUpdate(req.user?._id,{$set:{coverImage:coverImage.url}},{new:true}).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,user,"coverImage Updated successfully"))
})
const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params
    if(!username?.trim())
    {
        throw new ApiError(400,"Username is missing")
    }
    const channel=await User.aggregate([
        {
        $match:{
            username:username?.toLowerCase()
        }
    },
    {$lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"

    }
    },
    {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"

        }
    },
    {
    $addFields:{
        subscribersCount:{
            $size:"$subscribers"
        },
        channelsSubscribedToCount:{
            $size:"$subscribedTo"
        },
        isSubscribed:{
            $cond:{
                if:{
                    $in:[req.user?._id,"$subscribers.subscriber"]
                },
                then:true,
                else:false
            }
        }
    }
    },
    {
        $project:{
            subscribersCount:1,
            channelsSubscribedToCount:1,
            isSubscribed:1,
            fullname:1,
            coverImage:1,
            avatar:1,
            username:1,
            email:1
        }
    }
])
if(!channel?.length)
{
    throw ApiError(404,"Channel Does not exist")
}
return res
.status(200)
.json(
    new ApiResponse(200,channel[0],"User channel fetched successfully")
)
})
const getUserWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
        $match:{
            _id:new mongoose.Types.ObjectId(req.user._id)
        }
    },
    {
        $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
                {
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[
                            {
                            $project:{
                             fullname:1,
                             usernmae:1,
                             avatar:1
                            }
                        }
                        ]
                    }
                },
                {
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }
            ]
        }
    }
    ])
    console.log("User:",req.user._id)
    console.log("User Watch History:", user[0].watchHistory);
return res
.status(200)
.json(
    new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History fetched successfuully"
    )
)
})
export {registerUser,loginUser,logOutUser,refreshAccessToken,changeCurrentPassword,updateAccountDetails,getCurrentUser,updateUserAvatar,updateUsercoverImage,getUserChannelProfile,getUserWatchHistory}