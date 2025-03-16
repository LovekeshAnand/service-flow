import {asyncHandler} from "./utils/asyncHandler.js";
import {ApiError} from "./utils/apiError.js"
import {User} from "./models/userSchema.model.js"
import {ApiResponse} from "./utils/apiResponse.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAcessAndRefreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh token.")
  }
}


const registerUser = asyncHandler( async (req, res) => {
    const {username, email, fullname, password} = req.body
    if(
      [fullname, email, username, password].some((field) => 
      field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required")
    } 

    const existedUser = await User.findOne({
      $or: [{username}, {email}] 
    })

    if(existedUser){
      throw new ApiError(409, "User with email or username already exists")
    }


    const user = await User.create({
      fullname,
      email,
      password,
      username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken" 
    ) 

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered successfully")
    )
} )


const loginUser = asyncHandler( async (req, res) => {

  const {email, password, username} = req.body

  if (!username && !email) {
    throw new ApiError(400, "username or email is required")
}

  const user = await User.findOne({
    $or: [{username}, {email}]
  })

  if (!user) {
    throw new ApiError(404, "User does not exist!")
  }


  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials!")
  }

  const {accessToken, refreshToken} = await generateAcessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  
  //CONFIGURING COOKIES
  const options = {
    httpOnly: true,
    secure: true
  }
 
  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "User logged in successfully!")
  )

})


const logoutUser = asyncHandler( async (req, res) => {

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true 
    }
  )
 

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refershToken", options)
  .json(new ApiResponse(200, {}, "User logged out successfully!"))
})


const refreshAccessToken = asyncHandler( async(req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request!!")
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id) 
  
    if (!user) {
      throw new ApiError(401, "invalid refresh token!")
    }
  
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used!") 
    }  
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    const {accessToken, newRefreshToken} = await generateAcessAndRefreshTokens(user._id) 
  
  
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access token refreshed")
    )
    
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized request!!")
  }
})



export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
}