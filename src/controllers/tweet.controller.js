import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import bcrypt from "bcrypt"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content,username,password}=req.body
    if ([content, username, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }
    const user=await User.findOne(
        {
            username:username.toLowerCase()
        }
    )
    if(!user)
    {
        throw new ApiError(404,"User not found")
    }
    const validPassword=await bcrypt.compare(password,user.password)
    if(!validPassword){
        throw new ApiError(401,"Invalid Password")
    }
   
    const tweet=await Tweet.create({
        content,
       // username:username.toLowerCase(),
        //password
        owner:user._id

    })
    if(!tweet)
    {
        throw new ApiError(500,"Something Went wrong while creating tweet")
    }
    return res.status(200).json(new ApiResponse(200,tweet,"Tweet Created"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params
    if(!userId)
        {
            throw new ApiError(400,"User Id is required")
        }
    let userTweet=await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project:{
                content:1,
                owner:1
            }
        }

    ])
    console.log(userTweet)
if(!userTweet.length)
{
    throw new ApiError(404,"UserTweet does not exist")
}
    return res.status(200).json(new ApiResponse(200,userTweet,"Tweet Fetched Successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params
    const {content}=req.body
    if(!tweetId)
    {
        throw new ApiError(400,"Tweet Id is required")
    }
    if (!content || !content.trim()) {
        throw new ApiError(400, "Content is required and cannot be empty");
    }
    const tweet=await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content
            }
        },
        {
            new:true
        }
    )
    if(!tweet)
    {
        throw new ApiError(404,"Error occurred while updating tweet")
    }
    return res.status(200).json(new ApiResponse(200,tweet,"Tweet Updated Successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params;
    if(!tweetId)
    {
        throw new ApiError(400,"Tweet is required")
    }
    const tweet=await Tweet.findByIdAndDelete(
        tweetId
    )
    if(!tweet)
        {
            throw new ApiError(404,"Error occurred while deleting tweet")
        }
    return res.status(200).json(new ApiResponse(200,tweet,"Tweet Deleted Successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}