import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/userSchema.model.js";
import { Feedback } from "../models/feedbackSchema.model.js";
import { Issue } from "../models/issueSchema.model.js";
import { ServiceVote } from "../models/serviceVoteSchema.model.js";
import { Service } from "../models/serviceSchema.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh token.");
  }
};


const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullname, password } = req.body;

  if (![fullname, email, username, password].every(Boolean)) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const user = await User.create({
    fullname,
    email,
    password,
    username: username.toLowerCase(),
  });


  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  if (!accessToken || !refreshToken) {
    throw new ApiError(500, "Failed to generate authentication tokens");
  }


  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });


  return res.status(201).json(
    new ApiResponse(201, { 
      user: createdUser, 
      accessToken
    }, "User registered successfully!")
  );
});



const loginUser = asyncHandler(async (req, res) => {
  const { email, password} = req.body;

  if (!email && !password) {
    throw new ApiError(400, "Password or email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exist!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials!");
  }


  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");


  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  if (!accessToken || !refreshToken) {
    throw new ApiError(500, "Failed to generate authentication tokens");
  }

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  return res.status(200).json(
    new ApiResponse(200, { 
      user: loggedInUser, 
      accessToken
    }, "User logged in successfully!")
  );
});


const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });

  return res
    .status(200)
    .clearCookie("accessToken", { httpOnly: true, secure: true })
    .clearCookie("refreshToken", { httpOnly: true, secure: true })
    .json(new ApiResponse(200, {}, "User logged out successfully!"));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request!");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    if (!user || incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid or expired refresh token!");
    }

    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
      .cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true })
      .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized request!");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { fullname, username, email, password, newPassword } = req.body;

  if (req.user._id.toString() !== userId) {
    throw new ApiError(403, "Unauthorized: You can only update your own account.");
  }

  let user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }


  if (!password) {
    throw new ApiError(400, "Current password is required to update details.");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect password.");
  }

  if (username && username !== user.username) {
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      throw new ApiError(409, "Username is already taken.");
    }
    user.username = username.toLowerCase();
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new ApiError(409, "Email is already in use by another user.");
    }
    user.email = email.toLowerCase();
  }

  if (fullname) user.fullname = fullname;
  if (newPassword) {
    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();


  const feedbacks = await Feedback.aggregate([
    { $match: { userId: user._id } },
    { $group: { _id: "$serviceId", count: { $sum: 1 } } }
  ]);

  const issues = await Issue.aggregate([
    { $match: { userId: user._id } },
    { $group: { _id: "$serviceId", count: { $sum: 1 } } }
  ]);


  const userStats = {
    feedbacks: feedbacks.map(({ _id, count }) => ({ serviceId: _id, count })),
    issues: issues.map(({ _id, count }) => ({ serviceId: _id, count })),
  };

  return res.status(200).json(new ApiResponse(200, { user, userStats }, "User updated successfully."));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;


  const user = await User.findById(userId).select("fullname email username createdAt");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const [feedbacks, issues, upvotedServices] = await Promise.all([
    Feedback.aggregate([
      { $match: { openedBy: user._id } }, 
      { $group: { _id: "$service", count: { $sum: 1 } } }
    ]),
    Issue.aggregate([
      { $match: { openedBy: user._id } }, 
      { $group: { _id: "$service", count: { $sum: 1 } } }
    ]),
    ServiceVote.find({ user: user._id }).populate('service', 'serviceName logo')
  ]);

  const userStats = {
    feedbacks: feedbacks
      .filter(feedback => feedback && feedback._id)
      .map(({ _id, count }) => ({ serviceId: _id, count })),
    issues: issues
      .filter(issue => issue && issue._id)
      .map(({ _id, count }) => ({ serviceId: _id, count })),
    upvotedServices: upvotedServices
      .filter(vote => vote && vote.service)
      .map(vote => ({
        serviceId: vote.service._id,
        serviceName: vote.service.serviceName,
        logo: vote.service.logo
      }))
  };

  return res.status(200).json(new ApiResponse(200, { user, userStats }, "User profile retrieved successfully."));
});

const getUserUpvotedServices = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (req.user._id.toString() !== userId) {
    throw new ApiError(403, "Unauthorized: You can only view your own upvoted services.");
  }

  const totalUpvotedServices = await ServiceVote.countDocuments({ user: userId });
  const totalPages = Math.ceil(totalUpvotedServices / limit);

  const upvotedServices = await ServiceVote.find({ user: userId })
    .populate('service', 'serviceName logo description upvotes')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const services = upvotedServices.map(vote => vote.service);

  return res.status(200).json(
    new ApiResponse(200, { 
      services, 
      totalPages, 
      currentPage: parseInt(page),
      totalUpvotedServices
    }, "User upvoted services retrieved successfully.")
  );
});

const getUserIssues = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { 
    page = 1, 
    limit = 10, 
    search = "", 
    sortBy = "createdAt", 
    sortOrder = "desc",
    status
  } = req.query;


  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }


  if (req.user._id.toString() !== userId && req.user.role !== "admin") {
    throw new ApiError(403, "Unauthorized: You can only view your own issues.");
  }

  const pageInt = parseInt(page);
  const limitInt = parseInt(limit);
  const skip = (pageInt - 1) * limitInt;

  const query = { openedBy: userId };


  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  if (status) {
    query.status = status;
  }

  const sortOptions = {};
  if (sortBy === "upvotes") {
    sortOptions.upvotes = sortOrder === "asc" ? 1 : -1;
  } else if (sortBy === "createdAt") {
    sortOptions.createdAt = sortOrder === "asc" ? 1 : -1;
  } else {
    sortOptions.createdAt = -1;
  }

  const totalIssues = await Issue.countDocuments(query);
  const totalPages = Math.ceil(totalIssues / limitInt);

  const issues = await Issue.find(query)
    .populate("service", "serviceName logo")
    .select("title description status upvotes createdAt updatedAt service")
    .sort(sortOptions)
    .skip(skip)
    .limit(limitInt);

  const paginationInfo = {
    totalIssues,
    totalPages,
    currentPage: pageInt,
    hasNextPage: pageInt < totalPages,
    hasPrevPage: pageInt > 1
  };

  return res.status(200).json(
    new ApiResponse(
      200, 
      { 
        issues, 
        pagination: paginationInfo,
        user: {
          _id: user._id,
          username: user.username,
          fullname: user.fullname
        }
      }, 
      "User issues retrieved successfully."
    )
  );
});


const getUserFeedbacks = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { 
    page = 1, 
    limit = 10, 
    search = "", 
    sortBy = "createdAt", 
    sortOrder = "desc",
    rating
  } = req.query;


  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (req.user._id.toString() !== userId && req.user.role !== "admin") {
    throw new ApiError(403, "Unauthorized: You can only view your own feedbacks.");
  }

  const pageInt = parseInt(page);
  const limitInt = parseInt(limit);
  const skip = (pageInt - 1) * limitInt;

  const query = { openedBy: userId };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  if (rating) {
    query.rating = parseInt(rating);
  }

  const sortOptions = {};
  if (sortBy === "rating") {
    sortOptions.rating = sortOrder === "asc" ? 1 : -1;
  } else if (sortBy === "upvotes") {
    sortOptions.upvotes = sortOrder === "asc" ? 1 : -1;
  } else if (sortBy === "createdAt") {
    sortOptions.createdAt = sortOrder === "asc" ? 1 : -1;
  } else {
    sortOptions.createdAt = -1;
  }


  const totalFeedbacks = await Feedback.countDocuments(query);
  const totalPages = Math.ceil(totalFeedbacks / limitInt);


  const feedbacks = await Feedback.find(query)
    .populate("service", "serviceName logo")
    .select("title description rating upvotes createdAt updatedAt service")
    .sort(sortOptions)
    .skip(skip)
    .limit(limitInt);

  const paginationInfo = {
    totalFeedbacks,
    totalPages,
    currentPage: pageInt,
    hasNextPage: pageInt < totalPages,
    hasPrevPage: pageInt > 1
  };

  return res.status(200).json(
    new ApiResponse(
      200, 
      { 
        feedbacks, 
        pagination: paginationInfo,
        user: {
          _id: user._id,
          username: user.username,
          fullname: user.fullname
        }
      }, 
      "User feedbacks retrieved successfully."
    )
  );
});

export { 
  registerUser, 
  loginUser, 
  logoutUser, 
  refreshAccessToken, 
  updateUser, 
  getUserProfile, 
  getUserUpvotedServices,
  getUserIssues,
  getUserFeedbacks
};