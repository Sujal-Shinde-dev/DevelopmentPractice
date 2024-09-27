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
        username:username.toLowerCase(),
        password
    })
    const createTweet=await Tweet.findById(tweet._id).select(
        "-password"
    )
    if(!createTweet)
    {
        throw new ApiError(500,"Something Went wrong while creating tweet")
    }
    return res.status(200).json(new ApiResponse(200,createTweet,"Tweet Created"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}